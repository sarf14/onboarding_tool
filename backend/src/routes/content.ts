import express from 'express';
import { courseContent } from '../data/courseContent';
import { getQuiz } from '../data/quizzes';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';

const router = express.Router();

// Helper: ensure user has completed all previous sections with 90%+ quiz
async function ensureSectionAccess(userId: string, targetSection: number): Promise<{ allowed: boolean; message?: string }> {
  // Section 1 is always allowed
  if (targetSection <= 1) {
    return { allowed: true };
  }

  // Gate sections 2-5 (section 1 is always accessible)
  const maxSection = 5;
  const sectionNum = Math.min(targetSection, maxSection);

  // Fetch progress for all earlier sections (mapped to day 1-4)
  const { data: progress, error } = await supabase
    .from('progress')
    .select('day, status, dayEndQuizScore')
    .eq('userId', userId)
    .lt('day', sectionNum)
    .order('day', { ascending: true });

  if (error) {
    console.error('Error checking section access:', error);
    // On error, be safe and deny access
    return { 
      allowed: false, 
      message: 'Unable to verify your progress. Please try again or contact support.' 
    };
  }

  const passingScore = 90;
  const progressMap = new Map<number, { status: string; score: number | null }>();
  (progress || []).forEach((p: any) => {
    progressMap.set(p.day, { status: p.status, score: p.dayEndQuizScore });
  });

  // Ensure each previous section (1..sectionNum-1) is completed with 90%+
  for (let day = 1; day < sectionNum; day++) {
    const p = progressMap.get(day);
    const score = p?.score ?? null;
    const completed = p?.status === 'COMPLETED' && score !== null && score >= passingScore;
    if (!completed) {
      return {
        allowed: false,
        message: `You must complete Section ${day} with a quiz score of at least ${passingScore}% before accessing this section. Please review Section ${day} and retake its quiz.`,
      };
    }
  }

  return { allowed: true };
}

// Get all sections (for dashboard)
router.get('/sections', authenticate, async (req: AuthRequest, res) => {
  try {
    const sections = Object.keys(courseContent).map(key => {
      const section = courseContent[key as keyof typeof courseContent];
      return {
        id: key,
        title: section.title,
        description: section.description,
        estimatedDuration: section.estimatedDuration,
        hasQuiz: section.hasQuiz
      };
    });
    res.json({ sections });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get course content for a section
router.get('/section/:section', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    const userId = req.user!.id;
    const sectionNumber = parseInt(section, 10);
    let warning: string | undefined;

    if (!Number.isNaN(sectionNumber)) {
      const access = await ensureSectionAccess(userId, sectionNumber);
      if (!access.allowed) {
        warning = access.message || 'Please complete previous sections (90% or higher) before attempting this section.';
      }
    }

    const sectionKey = `section${section}` as keyof typeof courseContent;
    const content = courseContent[sectionKey];

    if (!content) {
      return res.status(404).json({ error: 'Section content not found' });
    }

    res.json({ section, content, warning });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get quiz for a section
router.get('/quiz/:section', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    const userId = req.user!.id;
    
    // Handle final quiz
    if (section === 'final') {
      const quiz = getQuiz('final');
      if (!quiz) {
        return res.status(404).json({ error: 'Final quiz not found' });
      }
      const access = await ensureSectionAccess(userId, 5); // treat final as after section 4
      const warning = !access.allowed ? (access.message || 'Please complete all sections (90% or higher) before taking the final assessment.') : undefined;
      return res.json({ section: 'final', quiz, warning });
    }
    
    const sectionKey = `section${section}`;
    const quiz = getQuiz(sectionKey);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let warning: string | undefined;
    if (!Number.isNaN(parseInt(section, 10))) {
      const access = await ensureSectionAccess(userId, parseInt(section, 10));
      if (!access.allowed) {
        warning = access.message || 'Please complete previous sections (90% or higher) before attempting this quiz.';
      }
    }
    res.json({ section, quiz, warning });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Get activity content
router.get('/activity/:section/:activityIndex', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section, activityIndex } = req.params;
    const userId = req.user!.id;
    const sectionNumber = parseInt(section, 10);
    let warning: string | undefined;
    if (!Number.isNaN(sectionNumber)) {
      const access = await ensureSectionAccess(userId, sectionNumber);
      if (!access.allowed) {
        warning = access.message || 'Please complete previous sections (90% or higher) before attempting this activity.';
      }
    }

    const sectionKey = `section${section}` as keyof typeof courseContent;
    const content = courseContent[sectionKey];
    const activityIdx = parseInt(activityIndex);

    if (!content) {
      return res.status(404).json({ error: 'Section content not found' });
    }

    if (!content.activities || activityIdx < 0 || activityIdx >= content.activities.length) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = content.activities[activityIdx];
    
    // Handle both old string format and new object format
    let activityData: any;
    if (typeof activity === 'string') {
      // Old format: string
      const activityStr = activity as string;
      activityData = {
        name: activityStr,
        type: activityStr.split(':')[0].toLowerCase().trim(),
        content: activityStr.split(':').slice(1).join(':').trim(),
        pageUrl: null,
        pageNumber: null
      };
    } else {
      // New format: object
      activityData = activity;
    }

    // Only include documents/videos that are actually used in this activity
    let relatedDocuments: any[] = [];
    let videoUrl: string | null = null;

    // If activity has a pageUrl, check if it matches any document URL
    if (activityData.pageUrl) {
      const allDocuments = content.documents || [];
      // Normalize URLs for comparison (remove trailing slashes, fragments, etc.)
      const normalizeUrl = (url: string) => {
        try {
          const urlObj = new URL(url);
          return `${urlObj.origin}${urlObj.pathname}`.toLowerCase();
        } catch {
          return url.toLowerCase();
        }
      };
      
      const activityUrlNormalized = normalizeUrl(activityData.pageUrl);
      relatedDocuments = allDocuments.filter((doc: any) => {
        const docUrlNormalized = normalizeUrl(doc.url);
        return docUrlNormalized === activityUrlNormalized || 
               activityUrlNormalized.includes(docUrlNormalized) ||
               docUrlNormalized.includes(activityUrlNormalized);
      });
    }

    // Only include video if activity type is "watch"
    if (activityData.type === 'watch') {
      // Check if activity has its own videoUrl, otherwise use section videoUrl
      videoUrl = activityData.videoUrl || (content as any).videoUrl || null;
    }

    res.json({
      section,
      activityIndex: activityIdx,
      activity: activityData.name || (typeof activityData === 'string' ? activityData : ''),
      activityType: activityData.type || '',
      activityName: activityData.content || (typeof activityData.name === 'string' ? activityData.name.split(':').slice(1).join(':').trim() : activityData.name) || '',
      content: activityData.content || null,
      pageUrl: activityData.pageUrl || null,
      pageNumber: activityData.pageNumber || null,
      imageUrl: activityData.imageUrl || null,
      sectionTitle: content.title,
      topics: content.topics || [],
      documents: relatedDocuments,
      videoUrl,
      videoUrl2: activityData.videoUrl2 || null,
      videoEmbedUrl2: activityData.videoEmbedUrl2 || null,
      allActivities: content.activities.map((a: any) => typeof a === 'string' ? a : a.name),
      warning,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;

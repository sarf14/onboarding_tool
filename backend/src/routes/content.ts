import express from 'express';
import { courseContent } from '../data/courseContent';
import { getQuiz } from '../data/quizzes';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all sections (for dashboard)
router.get('/sections', authenticate, async (req, res) => {
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
router.get('/section/:section', authenticate, async (req, res) => {
  try {
    const { section } = req.params;
    const sectionKey = `section${section}` as keyof typeof courseContent;
    const content = courseContent[sectionKey];

    if (!content) {
      return res.status(404).json({ error: 'Section content not found' });
    }

    res.json({ section, content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get quiz for a section
router.get('/quiz/:section', authenticate, async (req, res) => {
  try {
    const { section } = req.params;
    
    // Handle final quiz
    if (section === 'final') {
      const quiz = getQuiz('final');
      if (!quiz) {
        return res.status(404).json({ error: 'Final quiz not found' });
      }
      return res.json({ section: 'final', quiz });
    }
    
    const sectionKey = `section${section}`;
    const quiz = getQuiz(sectionKey);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ section, quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Get activity content
router.get('/activity/:section/:activityIndex', authenticate, async (req, res) => {
  try {
    const { section, activityIndex } = req.params;
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
      allActivities: content.activities.map((a: any) => typeof a === 'string' ? a : a.name)
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;

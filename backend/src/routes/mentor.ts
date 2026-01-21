import express from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all mentees for current mentor
router.get('/mentees', async (req: AuthRequest, res) => {
  try {
    const mentorId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // If admin, can specify mentorId in query
    const targetMentorId = isAdmin && req.query.mentorId ? req.query.mentorId : mentorId;

    // Verify user is a mentor
    const { data: mentor, error: mentorError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetMentorId)
      .single();

    if (mentorError || !mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    if (!mentor.roles?.includes('MENTOR') && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: mentees, error: menteesError } = await supabase
      .from('users')
      .select('id, email, name, roles, "currentDay", "programStartDate", "createdAt", "isActive"')
      .eq('mentorId', targetMentorId)
      .order('createdAt', { ascending: false });

    if (menteesError) throw menteesError;

    // Batch fetch all data in parallel for maximum speed
    const menteeIds = (mentees || []).map(m => m.id);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Fetch all progress, quizzes, and activities in parallel
    const [progressResult, quizzesResult, activitiesResult] = await Promise.all([
      menteeIds.length > 0 ? supabase
        .from('progress')
        .select('*')
        .in('userId', menteeIds)
        .order('day', { ascending: true }) : Promise.resolve({ data: [] }),
      menteeIds.length > 0 ? supabase
        .from('quizzes')
        .select('userId, day, percentage, "quizType", "completedAt", score, "maxScore", id')
        .in('userId', menteeIds)
        .gte('completedAt', oneDayAgo.toISOString())
        .order('completedAt', { ascending: false }) : Promise.resolve({ data: [] }),
      menteeIds.length > 0 ? (async () => {
        try {
          const result = await supabase
            .from('activities')
            .select('userId, section, day, "activityIndex"')
            .in('userId', menteeIds)
            .eq('status', 'COMPLETED');
          return result;
        } catch {
          return { data: [] };
        }
      })() : Promise.resolve({ data: [] })
    ]);

    // Group data by userId
    const progressByUser = new Map<string, any[]>();
    const quizzesByUser = new Map<string, any[]>();
    const activitiesByUser = new Map<string, any[]>();

    (progressResult.data || []).forEach((p: any) => {
      if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, []);
      progressByUser.get(p.userId)!.push(p);
    });

    (quizzesResult.data || []).forEach((q: any) => {
      if (!quizzesByUser.has(q.userId)) quizzesByUser.set(q.userId, []);
      quizzesByUser.get(q.userId)!.push(q);
    });

    (activitiesResult.data || []).forEach((a: any) => {
      if (!activitiesByUser.has(a.userId)) activitiesByUser.set(a.userId, []);
      activitiesByUser.get(a.userId)!.push(a);
    });

    // Map data to mentees (no async operations needed)
    const menteesWithProgress = (mentees || []).map((mentee) => {
      const progress = progressByUser.get(mentee.id) || [];
      const quizzes = quizzesByUser.get(mentee.id) || [];
      const activities = activitiesByUser.get(mentee.id) || [];

      const completedSections = progress.filter((p: any) => {
        return p.status === 'COMPLETED' && p.day <= 4;
      }).length;
      const overallProgress = Math.round((completedSections / 4) * 100);

      // Map quiz scores to section progress
      const sectionProgressWithQuizzes = progress.map((p: any) => {
        const section = p.day;
        const sectionQuiz = quizzes.find((q: any) => q.day === section && section <= 4);
        
        return {
          ...p,
          quizScore: sectionQuiz?.percentage || p.dayEndQuizScore,
          quizCompletedAt: sectionQuiz?.completedAt,
          passedQuiz: sectionQuiz ? sectionQuiz.percentage >= 80 : (p.dayEndQuizScore ? p.dayEndQuizScore >= 80 : false),
          quizId: sectionQuiz?.id,
        };
      });

      return {
        ...mentee,
        progress: overallProgress,
        completedSections,
        sectionProgress: sectionProgressWithQuizzes,
        quizzes: quizzes,
        activitiesCompleted: activities.length,
      };
    });

    res.json({ mentees: menteesWithProgress });
  } catch (error: any) {
    console.error('Get mentees error:', error);
    res.status(500).json({ error: 'Failed to fetch mentees', details: error.message });
  }
});

// Get detailed progress for a specific mentee
router.get('/mentees/:menteeId', async (req: AuthRequest, res) => {
  try {
    const { menteeId } = req.params;
    const mentorId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // Verify mentee belongs to mentor
    if (!isAdmin) {
      const { data: mentee } = await supabase
        .from('users')
        .select('id, "mentorId"')
        .eq('id', menteeId)
        .eq('mentorId', mentorId)
        .single();

      if (!mentee) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get mentee details
    const { data: mentee, error: menteeError } = await supabase
      .from('users')
      .select('id, email, name, "currentDay", "programStartDate", "createdAt"')
      .eq('id', menteeId)
      .single();

    if (menteeError || !mentee) {
      return res.status(404).json({ error: 'Mentee not found' });
    }

    // Get progress, quizzes, and activities in parallel for faster response
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const [progressResult, quizzesResult, activitiesResult] = await Promise.all([
      supabase
        .from('progress')
        .select('*')
        .eq('userId', menteeId)
        .order('day', { ascending: true }),
      supabase
        .from('quizzes')
        .select('*')
        .eq('userId', menteeId)
        .gte('completedAt', oneDayAgo.toISOString())
        .order('completedAt', { ascending: false }),
      (async () => {
        try {
          const result = await supabase
            .from('activities')
            .select('*')
            .eq('userId', menteeId)
            .order('day', { ascending: true })
            .order('activityIndex', { ascending: true });
          return result;
        } catch {
          return { data: [] };
        }
      })()
    ]);

    const progress = progressResult.data || [];
    const quizzes = quizzesResult.data || [];
    const activities = activitiesResult.data || [];
    
    // Map quiz scores to progress
    const progressWithQuizzes = progress.map((p: any) => {
      const section = p.day;
      const sectionQuiz = quizzes.find((q: any) => q.day === section && section <= 4);
      
      return {
        ...p,
        quizScore: sectionQuiz?.percentage || p.dayEndQuizScore,
        quizCompletedAt: sectionQuiz?.completedAt,
        passedQuiz: sectionQuiz ? sectionQuiz.percentage >= 80 : (p.dayEndQuizScore ? p.dayEndQuizScore >= 80 : false),
        quizId: sectionQuiz?.id,
      };
    });

    const completedSections = (progress || []).filter((p: any) => {
      return p.status === 'COMPLETED' && p.day <= 4;
    }).length;
    const overallProgress = Math.round((completedSections / 4) * 100);

    res.json({
      mentee: {
        ...mentee,
        overallProgress,
        completedSections,
      },
      progress: progressWithQuizzes,
      quizzes: quizzes || [],
      activities: activities || [],
    });
  } catch (error: any) {
    console.error('Get mentee details error:', error);
    res.status(500).json({ error: 'Failed to fetch mentee details', details: error.message });
  }
});

// Get complete quiz details for a mentee (questions, answers, etc.)
router.get('/mentees/:menteeId/quizzes/:quizId', async (req: AuthRequest, res) => {
  try {
    const { menteeId, quizId } = req.params;
    const mentorId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // Verify mentee belongs to mentor
    if (!isAdmin) {
      const { data: mentee } = await supabase
        .from('users')
        .select('id, "mentorId"')
        .eq('id', menteeId)
        .eq('mentorId', mentorId)
        .single();

      if (!mentee) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get complete quiz details
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('userId', menteeId)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ quiz });
  } catch (error: any) {
    console.error('Get quiz details error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz details', details: error.message });
  }
});

export default router;

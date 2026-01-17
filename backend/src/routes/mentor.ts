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

    // Get progress and quiz scores for each mentee
    const menteesWithProgress = await Promise.all(
      (mentees || []).map(async (mentee) => {
        // Get progress
        const { data: progress } = await supabase
          .from('progress')
          .select('*')
          .eq('userId', mentee.id)
          .order('day', { ascending: true });

        const completedSections = (progress || []).filter((p: any) => {
          return p.status === 'COMPLETED' && p.day <= 4;
        }).length;
        const overallProgress = Math.round((completedSections / 4) * 100);

        // Get quiz scores (database uses DAY_END_QUIZ instead of SECTION_QUIZ)
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('day, percentage, "quizType", "completedAt", score, "maxScore", id')
          .eq('userId', mentee.id)
          .order('completedAt', { ascending: false });
        
        // Map quiz scores to section progress
        const sectionProgressWithQuizzes = (progress || []).map((p: any) => {
          const section = p.day; // Progress uses day column
          const sectionQuiz = quizzes?.find((q: any) => {
            return q.day === section && section <= 4;
          });
          
          return {
            ...p,
            quizScore: sectionQuiz?.percentage || p.dayEndQuizScore,
            quizCompletedAt: sectionQuiz?.completedAt,
            passedQuiz: sectionQuiz ? sectionQuiz.percentage >= 80 : (p.dayEndQuizScore ? p.dayEndQuizScore >= 80 : false),
            quizId: sectionQuiz?.id,
          };
        });

        // Get activities completed (if table exists)
        let activities: any[] = [];
        try {
          const { data: activitiesData } = await supabase
            .from('activities')
            .select('section, day, "activityIndex"')
            .eq('userId', mentee.id)
            .eq('status', 'COMPLETED');
          activities = activitiesData || [];
        } catch (e) {
          // Activities table may not exist, ignore
        }

        return {
          ...mentee,
          progress: overallProgress,
          completedSections,
          sectionProgress: sectionProgressWithQuizzes,
          quizzes: quizzes || [],
          activitiesCompleted: (activities || []).length,
        };
      })
    );

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

    // Get progress
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', menteeId)
      .order('day', { ascending: true });

    // Get all quizzes with full details
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*')
      .eq('userId', menteeId)
      .order('completedAt', { ascending: false });
    
    // Map quiz scores to progress
    const progressWithQuizzes = (progress || []).map((p: any) => {
      const section = p.day; // Progress uses day column
      const sectionQuiz = quizzes?.find((q: any) => {
        return q.day === section && section <= 4;
      });
      
      return {
        ...p,
        quizScore: sectionQuiz?.percentage || p.dayEndQuizScore,
        quizCompletedAt: sectionQuiz?.completedAt,
        passedQuiz: sectionQuiz ? sectionQuiz.percentage >= 80 : (p.dayEndQuizScore ? p.dayEndQuizScore >= 80 : false),
        quizId: sectionQuiz?.id,
      };
    });

    // Get all activities (if table exists)
    let activities: any[] = [];
    try {
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('userId', menteeId)
        .order('day', { ascending: true })
        .order('activityIndex', { ascending: true });
      activities = activitiesData || [];
    } catch (e) {
      // Activities table may not exist, ignore
    }

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

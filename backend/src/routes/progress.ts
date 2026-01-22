import express from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getISTDate } from '../utils/date';

const router = express.Router();

// Get user's progress
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data: progress, error } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', userId)
      .order('day', { ascending: true });

    if (error) throw error;

    // Get quiz scores for sections (days 1-4)
    // Note: Database uses DAY_END_QUIZ instead of SECTION_QUIZ
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('day, percentage, "quizType", "completedAt"')
      .eq('userId', userId)
      .in('quizType', ['DAY_END_QUIZ'])
      .order('completedAt', { ascending: false });

    // Map quiz scores to progress entries
    // Also create progress entries for sections with completed quizzes but no progress entry
    const progressMap = new Map();
    (progress || []).forEach((p: any) => {
      progressMap.set(p.day, p);
    });
    
    // Find quizzes for sections 1-4 and ensure progress entries exist
    const sectionQuizzes = (quizzes || []).filter((q: any) => q.day && q.day <= 4);
    
    // Create progress entries for sections with quizzes but no progress entry
    for (const quiz of sectionQuizzes) {
      if (!progressMap.has(quiz.day)) {
        // Create a progress entry for this section based on quiz score
        const passingScore = 90;
        progressMap.set(quiz.day, {
          day: quiz.day,
          section: quiz.day,
          status: quiz.percentage >= passingScore ? 'COMPLETED' : (quiz.percentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'),
          dayEndQuizScore: quiz.percentage,
          quizScore: quiz.percentage,
          quizCompletedAt: quiz.completedAt,
          passedQuiz: quiz.percentage >= passingScore,
        });
      }
    }
    
    const progressWithQuizzes = Array.from(progressMap.values()).map((p: any) => {
      const section = p.day; // Progress uses day column
      // Find the best quiz score for this section (day 1-4)
      const sectionQuiz = quizzes?.find((q: any) => {
        return q.day === section && section <= 4;
      });
      
      const passingScore = 90;
      const quizScore = sectionQuiz?.percentage || p.dayEndQuizScore;
      const passedQuiz = quizScore !== undefined && quizScore >= passingScore;
      
      // Update status based on quiz score if quiz exists
      let status = p.status || 'NOT_STARTED';
      if (sectionQuiz && status === 'NOT_STARTED') {
        status = quizScore >= passingScore ? 'COMPLETED' : (quizScore > 0 ? 'IN_PROGRESS' : 'NOT_STARTED');
      } else if (sectionQuiz && status !== 'COMPLETED' && quizScore >= passingScore) {
        status = 'COMPLETED';
      }
      
      return {
        ...p,
        section: p.section || p.day,
        quizScore,
        quizCompletedAt: sectionQuiz?.completedAt || p.quizCompletedAt,
        passedQuiz,
        status,
      };
    });

    // Calculate overall progress - only count days 1-4 as sections
    const completedSections = progressWithQuizzes.filter((p: any) => {
      return p.status === 'COMPLETED' && (p.section || p.day) <= 4;
    }).length;
    const totalSections = 4;
    const overallProgress = Math.round((completedSections / totalSections) * 100);

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('"currentDay", "programStartDate"')
      .eq('id', userId)
      .single();

    res.json({
      progress: progressWithQuizzes,
      overallProgress,
      completedSections,
      totalSections,
      currentSection: user?.currentDay || 1,
      programStartDate: user?.programStartDate,
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress', details: error.message });
  }
});

// Get progress for specific user (Mentor or Admin)
router.get('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');
    const isMentor = req.user!.roles.includes('MENTOR');

    // Check permissions
    if (userId !== currentUserId && !isAdmin) {
      if (isMentor) {
        // Check if this user is a mentee
        const { data: mentee } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .eq('mentorId', currentUserId)
          .single();

        if (!mentee) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get progress and quizzes in parallel for faster response
    const [progressResult, quizzesResult] = await Promise.all([
      supabase
        .from('progress')
        .select('*')
        .eq('userId', userId)
        .order('day', { ascending: true }),
      supabase
        .from('quizzes')
        .select('day, percentage, "quizType", "completedAt"')
        .eq('userId', userId)
        .in('quizType', ['DAY_END_QUIZ'])
        .order('completedAt', { ascending: false })
    ]);

    if (progressResult.error) throw progressResult.error;

    const progress = progressResult.data || [];
    const quizzes = quizzesResult.data || [];

    // Map quiz scores to progress entries
    // Also create progress entries for sections with completed quizzes but no progress entry
    const progressMap = new Map();
    (progress || []).forEach((p: any) => {
      progressMap.set(p.day, p);
    });
    
    // Find quizzes for sections 1-4 and ensure progress entries exist
    const sectionQuizzes = (quizzes || []).filter((q: any) => q.day && q.day <= 4);
    
    // Create progress entries for sections with quizzes but no progress entry
    for (const quiz of sectionQuizzes) {
      if (!progressMap.has(quiz.day)) {
        // Create a progress entry for this section based on quiz score
        const passingScore = 90;
        progressMap.set(quiz.day, {
          day: quiz.day,
          section: quiz.day,
          status: quiz.percentage >= passingScore ? 'COMPLETED' : (quiz.percentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'),
          dayEndQuizScore: quiz.percentage,
          quizScore: quiz.percentage,
          quizCompletedAt: quiz.completedAt,
          passedQuiz: quiz.percentage >= passingScore,
        });
      }
    }
    
    const progressWithQuizzes = Array.from(progressMap.values()).map((p: any) => {
      const section = p.day; // Progress uses day column
      // Find the best quiz score for this section (day 1-4)
      const sectionQuiz = quizzes?.find((q: any) => {
        return q.day === section && section <= 4;
      });
      
      const passingScore = 90;
      const quizScore = sectionQuiz?.percentage || p.dayEndQuizScore;
      const passedQuiz = quizScore !== undefined && quizScore >= passingScore;
      
      // Update status based on quiz score if quiz exists
      let status = p.status || 'NOT_STARTED';
      if (sectionQuiz && status === 'NOT_STARTED') {
        status = quizScore >= passingScore ? 'COMPLETED' : (quizScore > 0 ? 'IN_PROGRESS' : 'NOT_STARTED');
      } else if (sectionQuiz && status !== 'COMPLETED' && quizScore >= passingScore) {
        status = 'COMPLETED';
      }
      
      return {
        ...p,
        section: p.section || p.day,
        quizScore,
        quizCompletedAt: sectionQuiz?.completedAt || p.quizCompletedAt,
        passedQuiz,
        status,
      };
    });

    const completedSections = progressWithQuizzes.filter((p: any) => {
      return p.status === 'COMPLETED' && (p.section || p.day) <= 4;
    }).length;
    const totalSections = 4;
    const overallProgress = Math.round((completedSections / totalSections) * 100);

    const { data: user } = await supabase
      .from('users')
      .select('"currentDay", "programStartDate"')
      .eq('id', userId)
      .single();

    res.json({
      progress: progressWithQuizzes,
      overallProgress,
      completedSections,
      totalSections,
      currentSection: user?.currentDay || 1,
      programStartDate: user?.programStartDate,
    });
  } catch (error: any) {
    console.error('Get user progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress', details: error.message });
  }
});

// Update progress for a day (mapped to section)
router.put('/day/:day', authenticate, async (req: AuthRequest, res) => {
  try {
    const { day } = req.params;
    const userId = req.user!.id;
    const dayNumber = parseInt(day);

    if (dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: 'Day must be between 1 and 7' });
    }

    const { status, miniQuiz1Score, miniQuiz2Score, dayEndQuizScore, tasksCompleted, tasksTotal } = req.body;

    // Calculate day progress
    let dayProgress = 0;
    if (tasksTotal > 0) {
      dayProgress = Math.round((tasksCompleted / tasksTotal) * 100);
    }

    // Check if progress exists
    const { data: existingProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', userId)
      .eq('day', dayNumber)
      .single();

    const updateData: any = {
      status: status || existingProgress?.status || 'NOT_STARTED',
      dayProgress,
    };

    if (miniQuiz1Score !== undefined) updateData.miniQuiz1Score = miniQuiz1Score;
    if (miniQuiz2Score !== undefined) updateData.miniQuiz2Score = miniQuiz2Score;
    if (dayEndQuizScore !== undefined) updateData.dayEndQuizScore = dayEndQuizScore;
    if (tasksCompleted !== undefined) updateData.tasksCompleted = tasksCompleted;
    if (tasksTotal !== undefined) updateData.tasksTotal = tasksTotal;

    if (status === 'IN_PROGRESS' && !existingProgress?.startedAt) {
      updateData.startedAt = getISTDate();
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = getISTDate();
    }

    let progress;
    if (existingProgress) {
      const { data, error } = await supabase
        .from('progress')
        .update(updateData)
        .eq('userId', userId)
        .eq('day', dayNumber)
        .select()
        .single();

      if (error) throw error;
      progress = data;
    } else {
      const { data, error } = await supabase
        .from('progress')
        .insert({
          userId,
          day: dayNumber,
          ...updateData,
          startedAt: status === 'IN_PROGRESS' ? getISTDate() : null,
          completedAt: status === 'COMPLETED' ? getISTDate() : null,
        })
        .select()
        .single();

      if (error) throw error;
      progress = data;
    }

    res.json({ message: 'Progress updated successfully', progress });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress', details: error.message });
  }
});

// Update progress for a section (maps to day)
router.put('/section/:section', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section } = req.params;
    const userId = req.user!.id;
    const dayNumber = parseInt(section); // Section maps to day

    if (dayNumber < 1 || dayNumber > 4) {
      return res.status(400).json({ error: 'Section must be between 1 and 4' });
    }

    const { status, quizScore } = req.body;

    // Check if progress exists
    const { data: existingProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', userId)
      .eq('day', dayNumber)
      .single();

    const updateData: any = {
      status: status || existingProgress?.status || 'NOT_STARTED',
    };

    if (quizScore !== undefined) {
      updateData.dayEndQuizScore = quizScore;
    }

    if (status === 'IN_PROGRESS' && !existingProgress?.startedAt) {
      updateData.startedAt = getISTDate();
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = getISTDate();
    }

    let progress;
    if (existingProgress) {
      const { data, error } = await supabase
        .from('progress')
        .update(updateData)
        .eq('userId', userId)
        .eq('day', dayNumber)
        .select()
        .single();

      if (error) throw error;
      progress = data;
    } else {
      const { data, error } = await supabase
        .from('progress')
        .insert({
          userId,
          day: dayNumber,
          ...updateData,
          startedAt: status === 'IN_PROGRESS' ? getISTDate() : null,
          completedAt: status === 'COMPLETED' ? getISTDate() : null,
        })
        .select()
        .single();

      if (error) throw error;
      progress = data;
    }

    res.json({ message: 'Progress updated successfully', progress });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress', details: error.message });
  }
});

export default router;

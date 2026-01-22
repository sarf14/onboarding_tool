import express from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getISTDate } from '../utils/date';

const router = express.Router();

// Submit quiz
router.post('/submit', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section, quizType, questions, answers, timeTaken } = req.body;
    const userId = req.user!.id;

    if (!quizType || !questions || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate score
    let score = 0;
    const maxScore = questions.length;

    questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      
      // Support both single correct answer and array of correct answers
      if (Array.isArray(correctAnswer)) {
        // Multi-select: user must select ALL correct answers
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : (userAnswer !== -1 ? [userAnswer] : []);
        const correctAnswersSet = new Set(correctAnswer);
        const userAnswersSet = new Set(userAnswers);
        
        // Check if user selected exactly the correct answers (same length and all match)
        if (correctAnswersSet.size === userAnswersSet.size && 
            correctAnswer.every((ans: number) => userAnswersSet.has(ans))) {
          score++;
        }
      } else {
        // Single correct answer
        const userAns = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
        if (correctAnswer === userAns) {
          score++;
        }
      }
    });

    const percentage = Math.round((score / maxScore) * 100);

    // Map section to day for database compatibility (section 1-4 = day 1-4)
    const dayNumber = section ? parseInt(section) : null;

    // Check for existing quiz attempt
    // Map quizType for database compatibility
    const dbQuizType = quizType === 'SECTION_QUIZ' ? 'DAY_END_QUIZ' : quizType;
    const dbDay = dayNumber !== null ? dayNumber : (quizType === 'FINAL_ASSESSMENT' ? 0 : 1);
    
    const existingQuery = supabase
      .from('quizzes')
      .select('*')
      .eq('userId', userId)
      .eq('quizType', dbQuizType)
      .eq('day', dbDay)
      .order('completedAt', { ascending: false })
      .limit(1);

    const { data: existingQuizzes } = await existingQuery;

    const existingQuiz = existingQuizzes?.[0];
    const bestScore = existingQuiz ? Math.max(existingQuiz.bestScore, score) : score;
    const attempts = existingQuiz ? existingQuiz.attempts + 1 : 1;

    // Create quiz record (use day instead of section for database compatibility)
    // Note: dbQuizType and dbDay are already declared above
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        userId,
        day: dbDay,
        quizType: dbQuizType,
        questions,
        answers,
        score,
        maxScore,
        percentage,
        attempts,
        bestScore,
        timeTaken: timeTaken || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting quiz:', error);
      throw error;
    }

    // Update progress if section quiz (map section to day for database compatibility)
    if (section) {
      const dayNumber = section; // Section 1-4 maps to day 1-4
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('userId', userId)
        .eq('day', dayNumber)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if progress doesn't exist
        console.error('Error fetching progress:', progressError);
      }

      // Passing score is 90% (matching quiz requirement)
      const passingScore = 90;
      
      if (progress) {
        const { error: updateError } = await supabase
          .from('progress')
          .update({
            dayEndQuizScore: percentage,
            status: percentage >= passingScore ? 'COMPLETED' : (progress.status === 'COMPLETED' ? 'COMPLETED' : percentage > 0 ? 'IN_PROGRESS' : progress.status || 'NOT_STARTED'),
            completedAt: percentage >= passingScore ? getISTDate() : progress.completedAt || null,
            startedAt: progress.startedAt || getISTDate(),
          })
          .eq('userId', userId)
          .eq('day', dayNumber);
        
        if (updateError) {
          console.error('Error updating progress:', updateError);
          throw updateError;
        }
      } else {
        // Create progress entry if it doesn't exist
        const { error: insertError } = await supabase
          .from('progress')
          .insert({
            userId,
            day: dayNumber,
            dayEndQuizScore: percentage,
            status: percentage >= passingScore ? 'COMPLETED' : (percentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'),
            startedAt: getISTDate(),
            completedAt: percentage >= passingScore ? getISTDate() : null,
          });
        
        if (insertError) {
          console.error('Error inserting progress:', insertError);
          throw insertError;
        }
      }
    }

    res.json({
      message: 'Quiz submitted successfully',
      quiz: {
        id: quiz.id,
        score,
        maxScore,
        percentage,
        attempts,
        bestScore,
      },
    });
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz', details: error.message });
  }
});

// Get quiz results
router.get('/results', authenticate, async (req: AuthRequest, res) => {
  try {
    const { section, quizType } = req.query;
    const userId = req.user!.id;

    let query = supabase
      .from('quizzes')
      .select('id, day, "quizType", score, "maxScore", percentage, attempts, "bestScore", "completedAt", "timeTaken"')
      .eq('userId', userId)
      .order('completedAt', { ascending: false });

    if (section) {
      // Map section to day for database query
      const sectionNum = parseInt(section as string);
      if (!isNaN(sectionNum)) {
        query = query.eq('day', sectionNum);
      }
    }
    if (quizType) {
      query = query.eq('quizType', quizType);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    // Map day to section for frontend compatibility
    const quizzesWithSection = (quizzes || []).map((quiz: any) => ({
      ...quiz,
      section: quiz.day, // Add section field mapped from day
    }));

    res.json({ quizzes: quizzesWithSection });
  } catch (error: any) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results', details: error.message });
  }
});

// Get quiz results for specific user (Mentor or Admin)
router.get('/results/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');
    const isMentor = req.user!.roles.includes('MENTOR');

    // Check permissions
    if (userId !== currentUserId && !isAdmin) {
      if (isMentor) {
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

    const { section, quizType } = req.query;

    let query = supabase
      .from('quizzes')
      .select('id, day, section, "quizType", score, "maxScore", percentage, attempts, "bestScore", "completedAt", "timeTaken"')
      .eq('userId', userId)
      .order('completedAt', { ascending: false });

    if (section) {
      // Map section to day for database query
      query = query.eq('day', parseInt(section as string));
    }
    if (quizType) query = query.eq('quizType', quizType);

    const { data: quizzes, error } = await query;

    if (error) throw error;

    res.json({ quizzes: quizzes || [] });
  } catch (error: any) {
    console.error('Get user quiz results error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results', details: error.message });
  }
});

export default router;

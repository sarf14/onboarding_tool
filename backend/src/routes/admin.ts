import express from 'express';
import { supabase } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('users')
      .select('id, email, name, roles, "isActive", "createdAt", "currentDay", "programStartDate", "mentorId"', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(skip, skip + Number(limit) - 1);

    if (role) {
      query = query.contains('roles', [role as string]);
    }

    if (isActive !== undefined) {
      query = query.eq('isActive', isActive === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Get mentor info and progress for each user
    const usersWithDetails = await Promise.all(
      (users || []).map(async (user: any) => {
        let mentor = null;
        if (user.mentorId) {
          const { data: mentorData } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', user.mentorId)
            .single();
          mentor = mentorData;
        }

        // Get progress
        const { data: progress } = await supabase
          .from('progress')
          .select('*')
          .eq('userId', user.id)
          .order('day', { ascending: true });

        // Get quiz scores for sections (days 1-4)
        // Note: Database uses DAY_END_QUIZ instead of SECTION_QUIZ
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('day, percentage, "quizType", "completedAt"')
          .eq('userId', user.id)
          .in('quizType', ['DAY_END_QUIZ'])
          .order('completedAt', { ascending: false });

        // Map quiz scores to progress entries
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
          };
        });

        const completedSections = progressWithQuizzes.filter((p: any) => {
          const isCompleted = p.status === 'COMPLETED';
          // Only count days 1-4 as sections
          if (p.day) {
            return isCompleted && p.day <= 4;
          }
          return isCompleted;
        }).length;
        const overallProgress = Math.round((completedSections / 4) * 100);

        return {
          ...user,
          mentor,
          progress: overallProgress,
          completedSections,
          sectionProgress: progressWithQuizzes,
        };
      })
    );

    res.json({
      users: usersWithDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Toggle user role (TRAINEE/MENTOR)
router.post('/users/:userId/toggle-role', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // 'TRAINEE' or 'MENTOR'

    if (!role || !['TRAINEE', 'MENTOR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be TRAINEE or MENTOR' });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent toggling admin role
    if (user.roles?.includes('ADMIN')) {
      return res.status(400).json({ error: 'Cannot modify admin role' });
    }

    // Prevent self-modification
    if (req.user!.id === userId) {
      return res.status(400).json({ error: 'Cannot modify your own role' });
    }

    // Update roles
    const currentRoles = user.roles || [];
    let newRoles: string[];

    if (role === 'MENTOR') {
      // Add MENTOR role, keep TRAINEE if present
      newRoles = currentRoles.includes('MENTOR') 
        ? currentRoles 
        : [...currentRoles.filter((r: string) => r !== 'TRAINEE'), 'MENTOR'];
    } else {
      // Add TRAINEE role, remove MENTOR
      newRoles = currentRoles.includes('TRAINEE')
        ? currentRoles
        : [...currentRoles.filter((r: string) => r !== 'MENTOR'), 'TRAINEE'];
    }

    // If removing MENTOR role, unassign all mentees
    if (role === 'TRAINEE' && currentRoles.includes('MENTOR')) {
      await supabase
        .from('users')
        .update({ mentorId: null })
        .eq('mentorId', userId);
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ roles: newRoles })
      .eq('id', userId)
      .select('id, email, name, roles, "isActive"')
      .single();

    if (error) throw error;

    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Toggle role error:', error);
    res.status(500).json({ error: 'Failed to toggle role', details: error.message });
  }
});

// Toggle user active status
router.post('/users/:userId/toggle-active', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deactivation
    if (req.user!.id === userId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('"isActive"')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ isActive: !user.isActive })
      .eq('id', userId)
      .select('id, email, name, "isActive"')
      .single();

    if (error) throw error;

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Failed to toggle active status', details: error.message });
  }
});

// Assign mentor to trainee(s)
router.post('/assign-mentor', async (req: AuthRequest, res) => {
  try {
    const { mentorId, traineeIds } = req.body;

    if (!mentorId || !traineeIds || !Array.isArray(traineeIds) || traineeIds.length === 0) {
      return res.status(400).json({ error: 'Mentor ID and trainee IDs are required' });
    }

    // Verify mentor exists and has MENTOR role
    const { data: mentor, error: mentorError } = await supabase
      .from('users')
      .select('*')
      .eq('id', mentorId)
      .single();

    if (mentorError || !mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    if (!mentor.roles?.includes('MENTOR')) {
      return res.status(400).json({ error: 'User is not a mentor' });
    }

    // Check current mentee count for this mentor
    const { data: currentMentees, error: menteesError } = await supabase
      .from('users')
      .select('id')
      .eq('mentorId', mentorId);

    if (menteesError) {
      return res.status(500).json({ error: 'Failed to check current mentees' });
    }

    const currentMenteeCount = currentMentees?.length || 0;
    
    // Check if adding these trainees would exceed the limit of 2
    if (currentMenteeCount + traineeIds.length > 2) {
      return res.status(400).json({ 
        error: `A mentor can have a maximum of 2 trainees. This mentor currently has ${currentMenteeCount} trainee(s).` 
      });
    }

    // Verify trainees exist
    const { data: trainees, error: traineesError } = await supabase
      .from('users')
      .select('*')
      .in('id', traineeIds);

    if (traineesError || trainees.length !== traineeIds.length) {
      return res.status(400).json({ error: 'Some trainees not found' });
    }

    const results = [];

    // Assign mentor to each trainee
    for (const traineeId of traineeIds) {
      const trainee = trainees.find((t) => t.id === traineeId);

      // Update trainee's mentorId and set programStartDate if not set
      // Do this FIRST - this is the critical operation
      const updateData: any = { mentorId };

      if (!trainee?.programStartDate) {
        updateData.programStartDate = new Date().toISOString();
        updateData.currentDay = 1; // Use currentDay instead of currentSection
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', traineeId);
      
      if (updateError) {
        console.error(`Failed to update trainee ${traineeId}:`, updateError);
        throw updateError;
      }

      // Record in mentor history AFTER successful update (optional - don't fail if table doesn't exist)
      try {
        const { error: historyError } = await supabase.from('mentor_history').insert({
          userId: traineeId,
          mentorId,
          assignedBy: req.user!.id,
        });
        if (historyError) {
          console.warn('Could not insert mentor history (non-critical):', historyError.message);
          // Continue even if history insert fails
        }
      } catch (historyError: any) {
        console.warn('Could not insert mentor history (table may not exist):', historyError?.message || historyError);
        // Continue even if history insert fails
      }

      results.push({
        traineeId,
        mentorId,
        programStartDate: updateData.programStartDate || trainee?.programStartDate,
      });
    }

    res.json({
      message: 'Mentor assigned successfully',
      assignments: results,
    });
  } catch (error: any) {
    console.error('Assign mentor error:', error);
    res.status(500).json({ error: 'Failed to assign mentor', details: error.message });
  }
});

// Remove mentor assignment
router.delete('/remove-mentor/:traineeId', async (req: AuthRequest, res) => {
  try {
    const { traineeId } = req.params;

    const { data: trainee, error: traineeError } = await supabase
      .from('users')
      .select('*')
      .eq('id', traineeId)
      .single();

    if (traineeError || !trainee) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    if (!trainee.mentorId) {
      return res.status(400).json({ error: 'Trainee has no assigned mentor' });
    }

    // Update mentor history
    await supabase
      .from('mentor_history')
      .update({ removedAt: new Date().toISOString() })
      .eq('userId', traineeId)
      .eq('mentorId', trainee.mentorId)
      .is('removedAt', null);

    // Remove mentor assignment
    await supabase
      .from('users')
      .update({ mentorId: null })
      .eq('id', traineeId);

    res.json({ message: 'Mentor assignment removed successfully' });
  } catch (error: any) {
    console.error('Remove mentor error:', error);
    res.status(500).json({ error: 'Failed to remove mentor assignment', details: error.message });
  }
});

// Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const { data: mentors, error } = await supabase
      .from('users')
      .select('id, email, name, roles, "createdAt"')
      .contains('roles', ['MENTOR']);

    if (error) throw error;

    // Get mentee count for each mentor
    const mentorsWithCounts = await Promise.all(
      (mentors || []).map(async (mentor) => {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('mentorId', mentor.id);

        return {
          ...mentor,
          menteeCount: count || 0,
        };
      })
    );

    res.json({ mentors: mentorsWithCounts });
  } catch (error: any) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch mentors', details: error.message });
  }
});

// Create new user (Admin only)
router.post('/users', async (req, res) => {
  try {
    const { email, password, name, roles } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate roles
    const validRoles = ['TRAINEE', 'MENTOR', 'ADMIN'];
    const userRoles = Array.isArray(roles) ? roles : [roles || 'TRAINEE'];
    const invalidRoles = userRoles.filter((role: string) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        roles: userRoles,
        isActive: true,
        currentDay: 1,
      })
      .select('id, email, name, roles, "isActive", "createdAt", "currentDay"')
      .single();

    if (error) {
      console.error('Create user error:', error);
      throw error;
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prevent deleting yourself
    if (userId === (req as AuthRequest).user!.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, roles')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting other admins (optional safety check)
    if (user.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user's progress and quiz data first (cascade delete)
    await supabase.from('progress').delete().eq('userId', userId);
    await supabase.from('quizzes').delete().eq('userId', userId);
    await supabase.from('activities').delete().eq('userId', userId);
    
    // Delete mentor assignments
    await supabase.from('users').update({ mentorId: null }).eq('mentorId', userId);
    
    // Delete mentor history
    await supabase.from('mentor_history').delete().eq('userId', userId).or(`mentorId.eq.${userId}`);

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete user error:', deleteError);
      throw deleteError;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

export default router;

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

    // Batch fetch all data in parallel for maximum speed
    const userIds = (users || []).map(u => u.id);
    const mentorIds = [...new Set((users || []).filter(u => u.mentorId).map(u => u.mentorId))];
    
    // Fetch all mentors, progress, and quizzes in parallel
    const [mentorsResult, progressResult, quizzesResult] = await Promise.all([
      mentorIds.length > 0 ? supabase
        .from('users')
        .select('id, name, email')
        .in('id', mentorIds) : Promise.resolve({ data: [] }),
      userIds.length > 0 ? supabase
        .from('progress')
        .select('*')
        .in('userId', userIds)
        .order('day', { ascending: true }) : Promise.resolve({ data: [] }),
      userIds.length > 0 ? supabase
        .from('quizzes')
        .select('userId, day, percentage, "quizType", "completedAt"')
        .in('userId', userIds)
        .in('quizType', ['DAY_END_QUIZ'])
        .order('completedAt', { ascending: false }) : Promise.resolve({ data: [] })
    ]);

    const mentorsMap = new Map((mentorsResult.data || []).map(m => [m.id, m]));
    const progressByUser = new Map<string, any[]>();
    const quizzesByUser = new Map<string, any[]>();

    // Group progress and quizzes by userId
    (progressResult.data || []).forEach((p: any) => {
      if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, []);
      progressByUser.get(p.userId)!.push(p);
    });

    (quizzesResult.data || []).forEach((q: any) => {
      if (!quizzesByUser.has(q.userId)) quizzesByUser.set(q.userId, []);
      quizzesByUser.get(q.userId)!.push(q);
    });

    // Map data to users (no async operations needed)
    const usersWithDetails = (users || []).map((user: any) => {
      const mentor = user.mentorId ? mentorsMap.get(user.mentorId) || null : null;
      const progress = progressByUser.get(user.id) || [];
      const quizzes = quizzesByUser.get(user.id) || [];

      // Map quiz scores to progress entries
      const progressWithQuizzes = progress.map((p: any) => {
        const section = p.day;
        const sectionQuiz = quizzes.find((q: any) => q.day === section && section <= 4);
        
        return {
          ...p,
          quizScore: sectionQuiz?.percentage || p.dayEndQuizScore,
          quizCompletedAt: sectionQuiz?.completedAt,
          passedQuiz: sectionQuiz ? sectionQuiz.percentage >= 80 : (p.dayEndQuizScore ? p.dayEndQuizScore >= 80 : false),
        };
      });

      const completedSections = progressWithQuizzes.filter((p: any) => {
        const isCompleted = p.status === 'COMPLETED';
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
    });

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

    // Batch fetch all mentee counts in parallel
    const mentorIds = mentors.map(m => m.id);
    const menteeCounts = mentorIds.length > 0 ? await supabase
      .from('users')
      .select('mentorId')
      .in('mentorId', mentorIds) : { data: [] };
    
    // Count mentees per mentor
    const countMap = new Map<string, number>();
    (menteeCounts.data || []).forEach((u: any) => {
      if (u.mentorId) {
        countMap.set(u.mentorId, (countMap.get(u.mentorId) || 0) + 1);
      }
    });
    
    const mentorsWithCounts = mentors.map(mentor => ({
      ...mentor,
      menteeCount: countMap.get(mentor.id) || 0
    }));

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

// Reset progress for users who completed sections/quizzes
router.post('/reset-completed-progress', async (req, res) => {
  try {
    // Get all users who have completed sections (status = COMPLETED for days 1-4)
    const { data: completedProgress, error: progressError } = await supabase
      .from('progress')
      .select('userId')
      .eq('status', 'COMPLETED')
      .lte('day', 4);

    if (progressError) throw progressError;

    // Get unique user IDs
    const userIds = [...new Set((completedProgress || []).map((p: any) => p.userId))];

    if (userIds.length === 0) {
      return res.json({ 
        message: 'No users with completed progress found',
        resetCount: 0 
      });
    }

    // Delete progress for these users
    const { error: deleteProgressError } = await supabase
      .from('progress')
      .delete()
      .in('userId', userIds);

    if (deleteProgressError) throw deleteProgressError;

    // Delete quizzes for these users
    const { error: deleteQuizzesError } = await supabase
      .from('quizzes')
      .delete()
      .in('userId', userIds);

    if (deleteQuizzesError) throw deleteQuizzesError;

    // Reset currentDay to 1 for these users
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ currentDay: 1 })
      .in('id', userIds);

    if (updateUserError) throw updateUserError;

    res.json({ 
      message: `Successfully reset progress for ${userIds.length} users`,
      resetCount: userIds.length,
      userIds 
    });
  } catch (error: any) {
    console.error('Reset completed progress error:', error);
    res.status(500).json({ error: 'Failed to reset progress', details: error.message });
  }
});

// Reset progress for ALL users
router.post('/reset-all-progress', async (req, res) => {
  try {
    // Get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    const userIds = (allUsers || []).map((u: any) => u.id);

    if (userIds.length === 0) {
      return res.json({ 
        message: 'No users found',
        resetCount: 0 
      });
    }

    // Delete ALL progress records
    const { error: deleteProgressError } = await supabase
      .from('progress')
      .delete()
      .in('userId', userIds);

    if (deleteProgressError) {
      console.error('Error deleting progress:', deleteProgressError);
      throw deleteProgressError;
    }

    // Delete ALL quizzes
    const { error: deleteQuizzesError } = await supabase
      .from('quizzes')
      .delete()
      .in('userId', userIds);

    if (deleteQuizzesError) {
      console.error('Error deleting quizzes:', deleteQuizzesError);
      throw deleteQuizzesError;
    }

    // Delete ALL activities (if table exists)
    try {
      const { error: deleteActivitiesError } = await supabase
        .from('activities')
        .delete()
        .in('userId', userIds);

      if (deleteActivitiesError && !deleteActivitiesError.message?.includes('does not exist')) {
        console.error('Error deleting activities:', deleteActivitiesError);
        // Don't throw - activities table might not exist
      }
    } catch (e) {
      // Activities table might not exist, ignore
      console.warn('Activities table might not exist, skipping deletion');
    }

    // Delete ALL tasks (if table exists)
    try {
      const { error: deleteTasksError } = await supabase
        .from('tasks')
        .delete()
        .in('userId', userIds);

      if (deleteTasksError && !deleteTasksError.message?.includes('does not exist')) {
        console.error('Error deleting tasks:', deleteTasksError);
        // Don't throw - tasks table might not exist
      }
    } catch (e) {
      // Tasks table might not exist, ignore
      console.warn('Tasks table might not exist, skipping deletion');
    }

    // Reset currentDay to 1 for ALL users
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ currentDay: 1 })
      .in('id', userIds);

    if (updateUserError) {
      console.error('Error updating users:', updateUserError);
      throw updateUserError;
    }

    // Verify deletion - check if any progress records remain
    const { data: remainingProgress, error: checkProgressError } = await supabase
      .from('progress')
      .select('id')
      .in('userId', userIds)
      .limit(1);

    if (checkProgressError) {
      console.warn('Could not verify progress deletion:', checkProgressError);
    } else if (remainingProgress && remainingProgress.length > 0) {
      console.warn(`Warning: ${remainingProgress.length} progress records still exist after deletion`);
    }

    // Verify deletion - check if any quiz records remain
    const { data: remainingQuizzes, error: checkQuizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .in('userId', userIds)
      .limit(1);

    if (checkQuizzesError) {
      console.warn('Could not verify quiz deletion:', checkQuizzesError);
    } else if (remainingQuizzes && remainingQuizzes.length > 0) {
      console.warn(`Warning: ${remainingQuizzes.length} quiz records still exist after deletion`);
    }

    // Get final counts for verification
    const { count: finalProgressCount } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .in('userId', userIds);

    const { count: finalQuizCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .in('userId', userIds);

    res.json({ 
      message: `Successfully reset progress for ALL ${userIds.length} users`,
      resetCount: userIds.length,
      userIds,
      verification: {
        remainingProgressRecords: finalProgressCount || 0,
        remainingQuizRecords: finalQuizCount || 0,
        allCleared: (finalProgressCount || 0) === 0 && (finalQuizCount || 0) === 0
      }
    });
  } catch (error: any) {
    console.error('Reset all progress error:', error);
    res.status(500).json({ error: 'Failed to reset all progress', details: error.message });
  }
});

// Reset everything: Delete all quiz progress and unassign all mentors
router.post('/reset-everything', async (req, res) => {
  try {
    // Get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    const userIds = (allUsers || []).map((u: any) => u.id);

    if (userIds.length === 0) {
      return res.json({ 
        message: 'No users found',
        resetCount: 0 
      });
    }

    // Delete ALL quiz records
    const { error: deleteQuizzesError } = await supabase
      .from('quizzes')
      .delete()
      .in('userId', userIds);

    if (deleteQuizzesError) {
      console.error('Error deleting quizzes:', deleteQuizzesError);
      throw deleteQuizzesError;
    }

    // Delete ALL progress records
    const { error: deleteProgressError } = await supabase
      .from('progress')
      .delete()
      .in('userId', userIds);

    if (deleteProgressError) {
      console.error('Error deleting progress:', deleteProgressError);
      throw deleteProgressError;
    }

    // Delete ALL activities (if table exists)
    try {
      await supabase
        .from('activities')
        .delete()
        .in('userId', userIds);
    } catch (e) {
      // Activities table might not exist, ignore
    }

    // Delete ALL tasks (if table exists)
    try {
      await supabase
        .from('tasks')
        .delete()
        .in('userId', userIds);
    } catch (e) {
      // Tasks table might not exist, ignore
    }

    // Unassign ALL mentors (set mentorId to null for all users)
    const { error: unassignMentorsError } = await supabase
      .from('users')
      .update({ mentorId: null })
      .not('mentorId', 'is', null);

    if (unassignMentorsError) {
      console.error('Error unassigning mentors:', unassignMentorsError);
      // Don't throw - might be no mentors assigned
    }

    // Reset currentDay to 1 for ALL users
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ currentDay: 1 })
      .in('id', userIds);

    if (updateUserError) {
      console.error('Error updating users:', updateUserError);
      throw updateUserError;
    }

    // Get final counts for verification
    const { count: finalQuizCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .in('userId', userIds);

    const { count: finalProgressCount } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .in('userId', userIds);

    // Count users with mentors assigned
    const { count: usersWithMentors } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('mentorId', 'is', null);

    res.json({ 
      message: `Successfully reset everything for ALL ${userIds.length} users`,
      resetCount: userIds.length,
      userIds,
      verification: {
        remainingQuizRecords: finalQuizCount || 0,
        remainingProgressRecords: finalProgressCount || 0,
        usersWithMentors: usersWithMentors || 0,
        allCleared: (finalQuizCount || 0) === 0 && (finalProgressCount || 0) === 0 && (usersWithMentors || 0) === 0
      }
    });
  } catch (error: any) {
    console.error('Reset everything error:', error);
    res.status(500).json({ error: 'Failed to reset everything', details: error.message });
  }
});

export default router;

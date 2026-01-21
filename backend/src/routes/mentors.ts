import express from 'express';
import { supabase } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Assign mentor to mentee(s) (Admin only)
router.post('/assign', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { mentorId, menteeIds } = req.body;

    if (!mentorId || !menteeIds || !Array.isArray(menteeIds) || menteeIds.length === 0) {
      return res.status(400).json({ error: 'Mentor ID and mentee IDs are required' });
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

    // Verify mentees exist
    const { data: mentees, error: menteesError } = await supabase
      .from('users')
      .select('*')
      .in('id', menteeIds);

    if (menteesError || mentees.length !== menteeIds.length) {
      return res.status(400).json({ error: 'Some mentees not found' });
    }

    // Check if any mentee is already a mentor
    const menteesWhoAreMentors = mentees.filter((m) => m.roles?.includes('MENTOR'));
    if (menteesWhoAreMentors.length > 0) {
      return res.status(400).json({
        error: 'Cannot assign mentors as mentees',
        users: menteesWhoAreMentors.map((m) => ({ id: m.id, name: m.name })),
      });
    }

    // Check if mentor is trying to be assigned to themselves
    if (menteeIds.includes(mentorId)) {
      return res.status(400).json({ error: 'Mentor cannot be assigned to themselves' });
    }

    const results = [];

    // Assign mentor to each mentee
    for (const menteeId of menteeIds) {
      const mentee = mentees.find((m) => m.id === menteeId);

      // Record in mentor history
      await supabase.from('mentor_history').insert({
        userId: menteeId,
        mentorId,
        assignedBy: req.user!.id,
      });

      // Update mentee's mentorId and set programStartDate if not set
      const updateData: any = { mentorId };

      // Set programStartDate if this is the first mentor assignment
      if (!mentee?.programStartDate) {
        updateData.programStartDate = new Date().toISOString();
        updateData.currentDay = 1;
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', menteeId);

      results.push({
        menteeId,
        mentorId,
        programStartDate: updateData.programStartDate || mentee?.programStartDate,
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

// Remove mentor assignment (Admin only)
router.delete('/remove/:menteeId', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { menteeId } = req.params;

    const { data: mentee, error: menteeError } = await supabase
      .from('users')
      .select('*')
      .eq('id', menteeId)
      .single();

    if (menteeError || !mentee) {
      return res.status(404).json({ error: 'Mentee not found' });
    }

    if (!mentee.mentorId) {
      return res.status(400).json({ error: 'Mentee has no assigned mentor' });
    }

    // Update mentor history
    await supabase
      .from('mentor_history')
      .update({ removedAt: new Date().toISOString() })
      .eq('userId', menteeId)
      .eq('mentorId', mentee.mentorId)
      .is('removedAt', null);

    // Remove mentor assignment
    await supabase
      .from('users')
      .update({ mentorId: null })
      .eq('id', menteeId);

    res.json({ message: 'Mentor assignment removed successfully' });
  } catch (error: any) {
    console.error('Remove mentor error:', error);
    res.status(500).json({ error: 'Failed to remove mentor assignment', details: error.message });
  }
});

// Get all mentees for a mentor
router.get('/mentees', authenticate, async (req: AuthRequest, res) => {
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
      .select('id, email, name, roles, "currentDay", "programStartDate", "createdAt"')
      .eq('mentorId', targetMentorId);

    if (menteesError) throw menteesError;

    // Batch fetch all progress in parallel
    const menteeIds = (mentees || []).map(m => m.id);
    const progressResult = menteeIds.length > 0 ? await supabase
      .from('progress')
      .select('*')
      .in('userId', menteeIds) : { data: [] };

    const progressByUser = new Map<string, any[]>();
    (progressResult.data || []).forEach((p: any) => {
      if (!progressByUser.has(p.userId)) progressByUser.set(p.userId, []);
      progressByUser.get(p.userId)!.push(p);
    });

    const menteesWithProgress = (mentees || []).map((mentee) => {
      const progress = progressByUser.get(mentee.id) || [];
      const completedDays = progress.filter((p) => p.status === 'COMPLETED').length;
      const overallProgress = Math.round((completedDays / 7) * 100);

      return {
        ...mentee,
        progress: overallProgress,
        completedDays,
      };
    });

    res.json({ mentees: menteesWithProgress });
  } catch (error: any) {
    console.error('Get mentees error:', error);
    res.status(500).json({ error: 'Failed to fetch mentees', details: error.message });
  }
});

// Get all mentors (Admin only)
router.get('/all', authenticate, authorize('ADMIN'), async (req, res) => {
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
      countMap.set(u.mentorId, (countMap.get(u.mentorId) || 0) + 1);
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

export default router;

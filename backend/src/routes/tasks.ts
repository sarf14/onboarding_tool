import express from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getISTDate } from '../utils/date';

const router = express.Router();

// Get tasks for a day
router.get('/day/:day', authenticate, async (req: AuthRequest, res) => {
  try {
    const { day } = req.params;
    const userId = req.user!.id;
    const dayNumber = parseInt(day);

    if (dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: 'Day must be between 1 and 7' });
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', userId)
      .eq('day', dayNumber)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    res.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// Create task (for assigning tasks from admin or system)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { day, taskUrl, taskName, userId } = req.body;
    const currentUserId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // Only admin can create tasks for other users
    const targetUserId = isAdmin && userId ? userId : currentUserId;

    if (!day || !taskUrl || !taskName) {
      return res.status(400).json({ error: 'Day, taskUrl, and taskName are required' });
    }

    const dayNumber = parseInt(day);
    if (dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: 'Day must be between 1 and 7' });
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        userId: targetUserId,
        day: dayNumber,
        taskUrl,
        taskName,
        status: 'NOT_STARTED',
      })
      .select()
      .single();

    if (error) throw error;

    // Update progress tasksTotal
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', targetUserId)
      .eq('day', dayNumber)
      .single();

    if (progress) {
      await supabase
        .from('progress')
        .update({ tasksTotal: progress.tasksTotal + 1 })
        .eq('userId', targetUserId)
        .eq('day', dayNumber);
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

// Update task status
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    if (!status || !['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.completedAt = getISTDate();
      updateData.submittedAt = getISTDate();
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update progress tasksCompleted
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('userId', userId)
      .eq('day', task.day)
      .single();

    if (progress) {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)
        .eq('day', task.day)
        .eq('status', 'COMPLETED');

      const tasksCompleted = count || 0;
      const dayProgress = progress.tasksTotal > 0
        ? Math.round((tasksCompleted / progress.tasksTotal) * 100)
        : 0;

      await supabase
        .from('progress')
        .update({ tasksCompleted, dayProgress })
        .eq('userId', userId)
        .eq('day', task.day);
    }

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

export default router;

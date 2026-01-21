import express from 'express';
import { supabase } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/password';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('users')
      .select('id, email, name, roles, "isActive", "createdAt", "currentDay", "programStartDate", "mentorId"', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(skip, skip + Number(limit) - 1);

    if (role) {
      query = query.contains('roles', [role as string]);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Batch fetch all mentors in parallel for faster response
    const mentorIds = [...new Set((users || []).filter(u => u.mentorId).map(u => u.mentorId))];
    const mentorsResult = mentorIds.length > 0 ? await supabase
      .from('users')
      .select('id, name, email')
      .in('id', mentorIds) : { data: [] };
    
    const mentorsMap = new Map((mentorsResult.data || []).map(m => [m.id, m]));
    const usersWithMentors = (users || []).map(user => ({
      ...user,
      mentor: user.mentorId ? mentorsMap.get(user.mentorId) || null : null
    }));

    res.json({
      users: usersWithMentors,
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

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user!.id !== id && !req.user!.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, roles, "isActive", "createdAt", "updatedAt", "mentorId", "programStartDate", "currentDay"')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get mentor and mentees in parallel for faster response
    const [mentorResult, menteesResult] = await Promise.all([
      user.mentorId ? supabase
        .from('users')
        .select('id, name, email')
        .eq('id', user.mentorId)
        .single() : Promise.resolve({ data: null }),
      supabase
        .from('users')
        .select('id, name, email, "currentDay", "programStartDate"')
        .eq('mentorId', id)
    ]);

    const mentor = mentorResult.data;
    const mentees = menteesResult.data || [];

    res.json({ user: { ...user, mentor, mentees: mentees || [] } });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

// Update user (Admin or self)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, roles, isActive, password } = req.body;

    // Check permissions
    const isAdmin = req.user!.roles.includes('ADMIN');
    const isSelf = req.user!.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Non-admins can only update their own name
    if (!isAdmin && (email || roles || isActive !== undefined)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email && isAdmin) updateData.email = email;
    if (roles && isAdmin) {
      const validRoles = ['TRAINEE', 'MENTOR', 'ADMIN'];
      const userRoles = Array.isArray(roles) ? roles : [roles];
      const invalidRoles = userRoles.filter((role) => !validRoles.includes(role));

      if (invalidRoles.length > 0) {
        return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
      }
      updateData.roles = userRoles;
    }
    if (isActive !== undefined && isAdmin) updateData.isActive = isActive;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, roles, "isActive", "updatedAt"')
      .single();

    if (error) throw error;

    res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user!.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

export default router;

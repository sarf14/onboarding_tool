import express from 'express';
import { supabase } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register (Admin only)
router.post('/register', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (!req.user?.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, name, roles } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate roles
    const validRoles = ['TRAINEE', 'MENTOR', 'ADMIN'];
    const userRoles = Array.isArray(roles) ? roles : [roles || 'TRAINEE'];
    const invalidRoles = userRoles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        roles: userRoles,
      })
      .select('id, email, name, roles, "createdAt"')
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, roles, "isActive", "createdAt", "updatedAt", "mentorId", "programStartDate", "currentDay"')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get mentor and mentees in parallel for faster response
    const [mentorResult, menteesResult] = await Promise.all([
      user.mentorId ? supabase
        .from('users')
        .select('id, name, email')
        .eq('id', user.mentorId)
        .single() : Promise.resolve({ data: null }),
      user.roles.includes('MENTOR') ? supabase
        .from('users')
        .select('id, name, email, "currentDay", "programStartDate"')
        .eq('mentorId', req.user!.id) : Promise.resolve({ data: [] })
    ]);

    const mentor = mentorResult.data;
    const mentees = menteesResult.data || [];

    res.json({
      user: {
        ...user,
        mentor,
        mentees,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

export default router;

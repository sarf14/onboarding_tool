import express from 'express';
import { supabase } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to get available user names (for debugging)
async function getAvailableUserNames(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('users')
      .select('name')
      .limit(10);
    return data?.map(u => u.name) || [];
  } catch {
    return [];
  }
}

// Create admin user endpoint (for initial setup) - GET version for easy browser access
router.get('/create-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', 'admin')
      .single();

    if (existingAdmin) {
      // Update existing admin password and ensure ADMIN role
      const hashedPassword = await hashPassword('admin');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          roles: ['ADMIN'],
          isActive: true,
        })
        .eq('name', 'admin');

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update admin user', details: updateError.message });
      }

      return res.json({
        message: 'Admin user password updated successfully',
        user: { name: 'admin', role: 'ADMIN' },
        credentials: { name: 'admin', password: 'admin' },
      });
    }

    // Create new admin user
    const hashedPassword = await hashPassword('admin');
    
    // Use placeholder email since database may still require it
    // User will be prompted to update email after first login
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: 'admin',
        email: 'admin@autonex.local', // Placeholder - will be updated after first login
        password: hashedPassword,
        roles: ['ADMIN'],
        isActive: true,
        currentDay: 1,
      })
      .select('id, name, roles')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create admin user', details: error.message });
    }

    res.json({
      message: 'Admin user created successfully',
      user: { name: user.name, role: user.roles },
      credentials: {
        name: 'admin',
        password: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user', details: error.message });
  }
});

// Create admin user endpoint (for initial setup) - POST version
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', 'admin')
      .single();

    if (existingAdmin) {
      // Update existing admin password and ensure ADMIN role
      const hashedPassword = await hashPassword('admin');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          roles: ['ADMIN'],
          isActive: true,
        })
        .eq('name', 'admin');

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update admin user', details: updateError.message });
      }

      return res.json({
        message: 'Admin user password updated successfully',
        user: { name: 'admin', role: 'ADMIN' },
      });
    }

    // Create new admin user
    const hashedPassword = await hashPassword('admin');
    
    // Use placeholder email since database may still require it
    // User will be prompted to update email after first login
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: 'admin',
        email: 'admin@autonex.local', // Placeholder - will be updated after first login
        password: hashedPassword,
        roles: ['ADMIN'],
        isActive: true,
        currentDay: 1,
      })
      .select('id, name, roles')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create admin user', details: error.message });
    }

    res.json({
      message: 'Admin user created successfully',
      user: { name: user.name, role: user.roles },
      credentials: {
        name: 'admin',
        password: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user', details: error.message });
  }
});

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

// Login - name-based login only (all users login with name)
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    console.log('Login attempt:', { name, passwordProvided: !!password });

    if (!password || !name) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Find user by name only (name-based login for all users)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name);

    if (error) {
      console.log('User lookup error:', error.message);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!users || users.length === 0) {
      console.log('User not found with name:', name);
      console.log('Available users in database:', await getAvailableUserNames());
      return res.status(401).json({ error: `User "${name}" not found. Please check your username or contact admin.` });
    }

    if (users.length > 1) {
      console.log('Multiple users found with name:', name);
      return res.status(500).json({ error: 'Multiple users found with same name. Please contact admin.' });
    }

    const user = users[0];

    if (!user.isActive) {
      console.log('User is inactive:', name);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, name: user.name, hasPassword: !!user.password });

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email || '',
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

// Update user email
router.put('/update-email', authenticate, async (req: AuthRequest, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email is already taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', req.user!.id)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Update user email
    const { data: user, error } = await supabase
      .from('users')
      .update({ email })
      .eq('id', req.user!.id)
      .select('id, email, name, roles, "isActive", "createdAt", "updatedAt", "mentorId", "programStartDate", "currentDay"')
      .single();

    if (error) throw error;

    res.json({
      message: 'Email updated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email', details: error.message });
  }
});

export default router;

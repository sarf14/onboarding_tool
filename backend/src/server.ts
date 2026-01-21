import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { supabase } from './config/database';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import progressRoutes from './routes/progress';
import mentorRoutes from './routes/mentors';
import mentorDashboardRoutes from './routes/mentor';
import adminRoutes from './routes/admin';
import quizRoutes from './routes/quizzes';
import taskRoutes from './routes/tasks';
import contentRoutes from './routes/content';
import chatRoutes from './routes/chat';
import h2hRoutes from './routes/h2h';
import { chatCleanupService } from './services/chatCleanup';
import { quizCleanupService } from './services/quizCleanup';

// Health check endpoint (lightweight - no DB query for ping services)
app.get('/api/health', async (req, res) => {
  // Lightweight health check for ping services (keeps Render awake)
  // Use /api/health/db for full health check with database verification
  res.json({ 
    status: 'ok', 
    message: 'Onboarding API is running',
    timestamp: new Date().toISOString()
  });
});

// Full health check with database verification (for monitoring/debugging)
app.get('/api/health/db', async (req, res) => {
  try {
    // Check database connection
    const { error } = await supabase.from('users').select('id').limit(1);
    res.json({ 
      status: 'ok', 
      message: 'Onboarding API is running',
      database: error ? 'disconnected' : 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentor', mentorDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/h2h', h2hRoutes);

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  
  // Start cleanup services
  chatCleanupService.start();
  quizCleanupService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  chatCleanupService.stop();
  quizCleanupService.stop();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  chatCleanupService.stop();
  quizCleanupService.stop();
  server.close(() => {
    process.exit(0);
  });
});

export default app;

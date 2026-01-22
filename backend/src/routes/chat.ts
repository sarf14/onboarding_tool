// Chat routes for LLM support assistant
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { chatService, ChatMessage } from '../services/chatService';
import { supabase } from '../config/database';
import { getISTDate, getISTDateDaysAgo, getISTDateFromDate } from '../utils/date';

const router = express.Router();

// POST /api/chat - Send a message to the support assistant
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user!.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Convert history to ChatMessage format if provided
    const conversationHistory: ChatMessage[] = Array.isArray(history)
      ? history.map((msg: any) => ({
          role: msg.role || 'user',
          content: msg.content || msg.message || '',
        }))
      : [];

    // Get response from chat service
    let response;
    try {
      response = await chatService.chat(message, conversationHistory);
    } catch (error) {
      // Fallback to simple search if LLM is not available
      console.warn('LLM service unavailable, using fallback:', error);
      try {
        response = chatService.getFallbackResponse(message);
      } catch (fallbackError) {
        // If fallback also fails, return a basic error response
        console.error('Fallback response also failed:', fallbackError);
        return res.status(500).json({
          error: 'Failed to process chat message',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: fallbackError instanceof Error ? fallbackError.message : 'Fallback service also failed',
        });
      }
    }

    // Save user message and assistant response to database (expires in 1 day)
    // Calculate expiration date in IST (1 day from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 1 day from now
    const expiresAtIST = getISTDateFromDate(expiresAt);

    try {
      // Save user message
      const { error: userMsgError } = await supabase.from('chat_messages').insert({
        userId,
        role: 'user',
        content: message,
        expiresAt: expiresAtIST,
      });

      if (userMsgError) {
        // If table doesn't exist, log but don't fail
        if (userMsgError.message?.includes('does not exist') || userMsgError.message?.includes('schema cache')) {
          console.warn('chat_messages table does not exist. Run migration: backend/supabase/migrations/002_add_chat_messages.sql');
        } else {
          console.error('Failed to save user message:', userMsgError);
        }
      }

      // Save assistant response
      const { error: assistantMsgError } = await supabase.from('chat_messages').insert({
        userId,
        role: 'assistant',
        content: response.message,
        sources: response.sources || [],
        contextUsed: response.contextUsed || [],
        expiresAt: expiresAtIST,
      });

      if (assistantMsgError) {
        // If table doesn't exist, log but don't fail
        if (assistantMsgError.message?.includes('does not exist') || assistantMsgError.message?.includes('schema cache')) {
          console.warn('chat_messages table does not exist. Run migration: backend/supabase/migrations/002_add_chat_messages.sql');
        } else {
          console.error('Failed to save assistant message:', assistantMsgError);
        }
      }
    } catch (dbError) {
      // Log but don't fail the request if DB save fails
      console.error('Failed to save chat messages:', dbError);
    }

    res.json({
      success: true,
      response: response.message,
      sources: response.sources,
      contextUsed: response.contextUsed,
      timestamp: getISTDate(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const userMessage = req.body?.message || 'N/A';
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      userId: req.user?.id,
      userMessage: typeof userMessage === 'string' ? userMessage.substring(0, 100) : 'N/A',
    });
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/chat/search - Search knowledge base (for testing/debugging)
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const { knowledgeBase } = await import('../services/knowledgeBase');
    const results = knowledgeBase.search(query, 10);

    res.json({
      success: true,
      query,
      results: results.map((chunk: any) => ({
        id: chunk.id,
        source: chunk.source,
        content: chunk.content.substring(0, 500) + '...',
        type: chunk.type,
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search knowledge base',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/chat/history/:traineeId - Get chat history for a trainee (Mentor only)
router.get('/history/:traineeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const mentorId = req.user!.id;
    const traineeId = req.params.traineeId;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // Verify user is a mentor or admin
    if (!req.user!.roles.includes('MENTOR') && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. Only mentors can view chat history.' });
    }

    // Verify trainee exists and get their mentor
    const { data: trainee, error: traineeError } = await supabase
      .from('users')
      .select('id, mentorId, name, email')
      .eq('id', traineeId)
      .single();

    if (traineeError || !trainee) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    // Verify mentor has access to this trainee (unless admin)
    if (!isAdmin && trainee.mentorId !== mentorId) {
      return res.status(403).json({ error: 'Access denied. You can only view chat history of your assigned trainees.' });
    }

    // Get chat history for this trainee (only from last 24 hours - older ones are automatically deleted by cleanup service)
    const oneDayAgo = getISTDateDaysAgo(1);
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('userId', traineeId)
      .gte('createdAt', oneDayAgo) // Only get messages from last 24 hours
      .order('createdAt', { ascending: true });

    if (messagesError) {
      // If table doesn't exist, return empty array instead of error
      if (messagesError.message?.includes('does not exist') || messagesError.message?.includes('schema cache')) {
        console.warn('chat_messages table does not exist. Run migration: backend/supabase/migrations/002_add_chat_messages.sql');
        return res.json({
          success: true,
          trainee: {
            id: trainee.id,
            name: trainee.name,
            email: trainee.email,
          },
          messages: [],
          count: 0,
          warning: 'Chat history table not found. Please run the database migration.',
        });
      }
      throw messagesError;
    }

    res.json({
      success: true,
      trainee: {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
      },
      messages: messages || [],
      count: messages?.length || 0,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/chat/history - Get chat history for all mentees (Mentor only)
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const mentorId = req.user!.id;
    const isAdmin = req.user!.roles.includes('ADMIN');

    // Verify user is a mentor or admin
    if (!req.user!.roles.includes('MENTOR') && !isAdmin) {
      return res.status(403).json({ error: 'Access denied. Only mentors can view chat history.' });
    }

    // Get all mentees for this mentor
    const { data: mentees, error: menteesError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('mentorId', mentorId);

    if (menteesError) {
      throw menteesError;
    }

    if (!mentees || mentees.length === 0) {
      return res.json({
        success: true,
        mentees: [],
        chatHistory: {},
      });
    }

    // Get chat history for all mentees (only from last 24 hours - older ones are automatically deleted by cleanup service)
    const menteeIds = mentees.map(m => m.id);
    const oneDayAgo = getISTDateDaysAgo(1);
    
    const { data: allMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .in('userId', menteeIds)
      .gte('createdAt', oneDayAgo) // Only get messages from last 24 hours
      .order('createdAt', { ascending: true });

    if (messagesError) {
      // If table doesn't exist, return empty data instead of error
      if (messagesError.message?.includes('does not exist') || messagesError.message?.includes('schema cache')) {
        console.warn('chat_messages table does not exist. Run migration: backend/supabase/migrations/002_add_chat_messages.sql');
        return res.json({
          success: true,
          mentees: mentees.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            messageCount: 0,
          })),
          chatHistory: {},
          warning: 'Chat history table not found. Please run the database migration.',
        });
      }
      throw messagesError;
    }

    // Group messages by trainee
    const chatHistory: Record<string, any[]> = {};
    mentees.forEach(mentee => {
      chatHistory[mentee.id] = [];
    });

    (allMessages || []).forEach(msg => {
      if (chatHistory[msg.userId]) {
        chatHistory[msg.userId].push(msg);
      }
    });

    res.json({
      success: true,
      mentees: mentees.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        messageCount: chatHistory[m.id]?.length || 0,
      })),
      chatHistory,
    });
  } catch (error) {
    console.error('Get all chat history error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

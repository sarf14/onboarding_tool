// Chat cleanup service - deletes expired chat messages (older than 1 day)
import { supabase } from '../config/database';

class ChatCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every hour

  start() {
    console.log('🧹 Starting chat cleanup service...');
    
    // Run cleanup immediately on start
    this.cleanup();

    // Then run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🧹 Chat cleanup service stopped');
    }
  }

  private async cleanup() {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const oneDayAgoISO = oneDayAgo.toISOString();
      
      // Delete all messages created more than 1 day ago (based on createdAt, not expiresAt)
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .lt('createdAt', oneDayAgoISO);

      if (error) {
        console.error('❌ Chat cleanup error:', error);
        return;
      }

      console.log(`✅ Chat cleanup completed at ${new Date().toISOString()} - deleted messages older than 1 day`);
    } catch (error) {
      console.error('❌ Chat cleanup failed:', error);
    }
  }
}

export const chatCleanupService = new ChatCleanupService();

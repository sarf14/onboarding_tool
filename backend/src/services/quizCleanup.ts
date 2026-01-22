// Quiz cleanup service - deletes quiz results older than 1 day
import { supabase } from '../config/database';
import { getISTDate, getISTDateDaysAgo } from '../utils/date';

class QuizCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every hour

  start() {
    console.log('🧹 Starting quiz cleanup service...');
    
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
      console.log('🧹 Quiz cleanup service stopped');
    }
  }

  private async cleanup() {
    try {
      const oneDayAgoISO = getISTDateDaysAgo(1);
      
      // Delete all quizzes completed more than 1 day ago
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .lt('completedAt', oneDayAgoISO);

      if (error) {
        console.error('❌ Quiz cleanup error:', error);
        return;
      }

      console.log(`✅ Quiz cleanup completed at ${getISTDate()} - deleted quizzes older than 1 day`);
    } catch (error) {
      console.error('❌ Quiz cleanup failed:', error);
    }
  }
}

export const quizCleanupService = new QuizCleanupService();

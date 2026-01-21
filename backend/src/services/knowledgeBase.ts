// Knowledge Base Service - RAG system for chat support
import { pageContent } from '../data/pageContent';
import { courseContent } from '../data/courseContent';
import { quizzes } from '../data/quizzes';

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
  type: 'page' | 'section' | 'quiz' | 'explanation';
}

class KnowledgeBase {
  private chunks: KnowledgeChunk[] = [];

  constructor() {
    this.buildKnowledgeBase();
  }

  private buildKnowledgeBase() {
    // Add page content
    Object.entries(pageContent).forEach(([pageNum, content]) => {
      this.chunks.push({
        id: `page-${pageNum}`,
        source: `Page ${pageNum}`,
        content: content,
        type: 'page',
      });
    });

    // Add course content sections
    Object.entries(courseContent).forEach(([sectionKey, section]) => {
      // Add section title and description
      this.chunks.push({
        id: `section-${sectionKey}-info`,
        source: section.title,
        content: `${section.title}\n\n${section.description}\n\nTopics: ${section.topics?.join(', ') || 'N/A'}`,
        type: 'section',
      });

      // Add activities
      if (section.activities) {
        section.activities.forEach((activity, index) => {
          this.chunks.push({
            id: `section-${sectionKey}-activity-${index}`,
            source: `${section.title} - Activity ${index + 1}`,
            content: `Activity: ${activity.name}\n\n${activity.description || ''}`,
            type: 'section',
          });
        });
      }
    });

    // Add quiz questions and explanations
    Object.entries(quizzes).forEach(([sectionKey, quiz]) => {
      quiz.questions.forEach((question, index) => {
        const questionText = `Question ${index + 1}: ${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nCorrect Answer: ${question.options[question.correctAnswer]}\n\nExplanation: ${question.explanation}`;
        
        this.chunks.push({
          id: `quiz-${sectionKey}-q${index + 1}`,
          source: `${quiz.title} - Question ${index + 1}`,
          content: questionText,
          type: 'quiz',
        });
      });
    });
  }

  // Simple keyword-based search (can be enhanced with semantic search later)
  search(query: string, limit: number = 10): KnowledgeChunk[] {
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    // Score chunks based on keyword matches
    const scoredChunks = this.chunks.map(chunk => {
      const lowerContent = chunk.content.toLowerCase();
      const lowerSource = chunk.source.toLowerCase();
      
      let score = 0;
      
      // Exact phrase match gets highest score
      if (lowerContent.includes(lowerQuery)) {
        score += 100;
      }
      if (lowerSource.includes(lowerQuery)) {
        score += 50;
      }
      
      // Word matches
      queryWords.forEach(word => {
        const wordCount = (lowerContent.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        score += wordCount * 10;
        
        if (lowerSource.includes(word)) {
          score += 5;
        }
      });
      
      return { chunk, score };
    });

    // Sort by score and return top results
    return scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.chunk);
  }
}

export const knowledgeBase = new KnowledgeBase();

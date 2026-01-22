// Knowledge Base Service - Aggregates all course content for RAG
// NOTE: Quiz content is EXCLUDED - chatbot only uses training materials
import { courseContent } from '../data/courseContent';
import { pageContent } from '../data/pageContent';
// import { quizzes } from '../data/quizzes'; // NOT IMPORTED - quiz content excluded from knowledge base
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';

export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  section?: string;
  topic?: string;
  type: 'page' | 'course' | 'quiz' | 'document';
}

class KnowledgeBaseService {
  private chunks: KnowledgeChunk[] = [];
  private initialized: boolean = false;

  constructor() {
    // Initialize asynchronously
    this.buildKnowledgeBase().then(() => {
      this.initialized = true;
    }).catch((error) => {
      console.error('Error initializing knowledge base:', error);
      // Continue with empty chunks if initialization fails
      this.chunks = [];
      this.initialized = true;
    });
  }

  private async buildKnowledgeBase() {
    // ONLY load these sources:
    // 1. Page content (from pageContent.ts)
    // 2. H2H document
    // 3. 3 user-provided documents
    
    // 1. Add all page content
    Object.entries(pageContent).forEach(([pageNum, content]) => {
      this.chunks.push({
        id: `page-${pageNum}`,
        content: content,
        source: `Page ${pageNum}`,
        type: 'page',
      });
    });

    // NOTE: Course content, quiz content, onboarding plan, and extracted data are EXCLUDED
    // Only page content, H2H doc, and 3 user documents are loaded

    // 2. Load H2H document
    await this.loadH2HDocument();

    // 3. Load the 3 user-provided documents
    await this.loadUserDocuments();
  }

  // Load H2H document only
  private async loadH2HDocument() {
    try {
      const possiblePaths = [
        path.join(__dirname, '../../../extracted/h2h'),
        path.join(process.cwd(), 'extracted/h2h'),
        path.join(process.cwd(), '../extracted/h2h'),
        path.join(process.cwd(), 'documents/h2h'),
        path.join(__dirname, '../../../documents/h2h'),
      ];
      
      for (const h2hPath of possiblePaths) {
        try {
          if (fs.existsSync(h2hPath) && fs.statSync(h2hPath).isDirectory()) {
            const files = fs.readdirSync(h2hPath);
            for (const file of files) {
              if (file.endsWith('.txt') || file.endsWith('.docx')) {
                try {
                  const filePath = path.join(h2hPath, file);
                  if (file.endsWith('.txt')) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    if (content.trim()) {
                      this.chunks.push({
                        id: `h2h-${file}`,
                        content: content.trim(),
                        source: `H2H Review: ${file.replace('.txt', '').replace('h2h_page_', 'Page ')}`,
                        type: 'document',
                      });
                    }
                  } else if (file.endsWith('.docx')) {
                    // Load docx file
                    await this.loadDocxFile(filePath, file);
                  }
                } catch (fileError) {
                  console.warn(`Could not read H2H file ${file}:`, fileError);
                }
              }
            }
            console.log(`✓ Loaded H2H content from ${h2hPath}`);
            break;
          }
        } catch (pathError) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Could not load H2H content:', error);
    }
  }

  // Load only the 3 user-provided documents
  private async loadUserDocuments() {
    // Define the 3 specific documents to load
    const userDocuments = [
      'EC Example Library - Part 1 (Prompt Errors & Model Actions).docx',
      'EC Example Library - Part 2 (Model Thoughts, Output, Infrastructure & Tool Errors).docx',
      'EC Example Library Recruitment test.docx',
    ];

    const possibleDocPaths = [
      path.join(process.cwd(), 'documents'),
      path.join(process.cwd(), '../documents'),
      path.join(__dirname, '../../../documents'),
      path.join(process.cwd(), 'backend/documents'),
      // Also check project root directory (where documents might be placed)
      path.join(__dirname, '../../../'),
      path.join(process.cwd(), '..'),
      process.cwd(), // Current working directory (could be project root)
    ];

    // First, try to find documents in directories
    for (const docPath of possibleDocPaths) {
      try {
        if (fs.existsSync(docPath) && fs.statSync(docPath).isDirectory()) {
          for (const docName of userDocuments) {
            const docFilePath = path.join(docPath, docName);
            try {
              if (fs.existsSync(docFilePath) && fs.statSync(docFilePath).isFile()) {
                console.log(`📄 Loading user document: ${docName}`);
                await this.loadDocxFile(docFilePath, docName);
              }
            } catch (fileError) {
              console.warn(`⚠ Could not load document ${docName}:`, fileError);
            }
          }
        }
      } catch (pathError) {
        continue;
      }
    }
    
    // Also check if documents are directly in root paths (not in subdirectories)
    const rootPaths = [
      path.join(__dirname, '../../../'),
      path.join(process.cwd(), '..'),
      process.cwd(),
    ];
    
    for (const rootPath of rootPaths) {
      try {
        if (fs.existsSync(rootPath)) {
          for (const docName of userDocuments) {
            const docFilePath = path.join(rootPath, docName);
            try {
              if (fs.existsSync(docFilePath) && fs.statSync(docFilePath).isFile()) {
                // Check if we haven't already loaded this document
                const alreadyLoaded = this.chunks.some(chunk => 
                  chunk.source.includes(docName.replace('.docx', ''))
                );
                if (!alreadyLoaded) {
                  console.log(`📄 Loading user document from root: ${docName}`);
                  await this.loadDocxFile(docFilePath, docName);
                }
              }
            } catch (fileError) {
              // Silently continue - document might not be in this location
            }
          }
        }
      } catch (pathError) {
        continue;
      }
    }

    console.log(`📚 Knowledge base loaded: ${this.chunks.length} total chunks`);
  }

  // REMOVED: loadCustomDocuments - we only load specific documents now

  private async loadDocumentsFromFolder(folderPath: string, basePath: string = '') {
    try {
      const items = fs.readdirSync(folderPath);
      
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const relativePath = basePath ? `${basePath}/${item}` : item;
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            // Recursively load from subdirectories
            await this.loadDocumentsFromFolder(itemPath, relativePath);
          } else if (stats.isFile()) {
            // Load text-based files
            const ext = path.extname(item).toLowerCase();
            
            if (ext === '.txt' || ext === '.md') {
              try {
                const content = fs.readFileSync(itemPath, 'utf-8');
                if (content.trim()) {
                  // Split large files into chunks
                  const chunks = this.splitIntoChunks(content, 8000);
                  chunks.forEach((chunk, idx) => {
                    this.chunks.push({
                      id: `doc-${relativePath.replace(/[^a-zA-Z0-9]/g, '-')}-${idx}`,
                      content: chunk.trim(),
                      source: `Document: ${relativePath}${chunks.length > 1 ? ` (Part ${idx + 1})` : ''}`,
                      type: 'document',
                    });
                  });
                  console.log(`  ✓ Loaded ${item} (${chunks.length} chunks)`);
                }
              } catch (fileError) {
                console.warn(`  ✗ Could not read ${item}:`, fileError);
              }
            } else if (ext === '.html') {
              // Load HTML files and extract text content
              try {
                const htmlContent = fs.readFileSync(itemPath, 'utf-8');
                const textContent = htmlContent
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                
                if (textContent.length > 100) {
                  const chunks = this.splitIntoChunks(textContent, 8000);
                  chunks.forEach((chunk, idx) => {
                    this.chunks.push({
                      id: `doc-html-${relativePath.replace(/[^a-zA-Z0-9]/g, '-')}-${idx}`,
                      content: chunk.trim(),
                      source: `Document: ${relativePath}${chunks.length > 1 ? ` (Part ${idx + 1})` : ''}`,
                      type: 'document',
                    });
                  });
                  console.log(`  ✓ Loaded ${item} (${chunks.length} chunks)`);
                }
              } catch (fileError) {
                console.warn(`  ✗ Could not read HTML ${item}:`, fileError);
              }
            } else if (ext === '.docx') {
              // Load DOCX files
              try {
                await this.loadDocxFile(itemPath, relativePath);
              } catch (error) {
                console.warn(`  ✗ Could not read DOCX ${item}:`, error);
              }
            }
          }
        } catch (itemError) {
          console.warn(`  ✗ Error processing ${item}:`, itemError);
        }
      }
    } catch (error) {
      console.warn(`Could not load documents from ${folderPath}:`, error);
    }
  }

  private async loadDocxFile(filePath: string, relativePath: string) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      
      if (text.trim().length > 100) {
        const chunks = this.splitIntoChunks(text, 10000);
        chunks.forEach((chunk, idx) => {
          this.chunks.push({
            id: `docx-${relativePath.replace(/[^a-zA-Z0-9]/g, '-')}-${idx}`,
            content: chunk.trim(),
            source: `Document: ${relativePath.replace('.docx', '')}${chunks.length > 1 ? ` (Part ${idx + 1})` : ''}`,
            type: 'document',
          });
        });
        console.log(`  ✓ Loaded ${relativePath} (${chunks.length} chunks)`);
      }
    } catch (error) {
      console.warn(`Error loading DOCX ${relativePath}:`, error);
      throw error;
    }
  }

  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    
    // Split by major section markers first
    const sectionMarkers = /(?:^|\n)(?:#{1,3}\s+|Example\s*:|Definition\s*:|Error\s*Type\s*:|Explanation\s*:|Dissatisfactory\s*Output\s*:)/i;
    const sections = text.split(sectionMarkers);
    
    if (sections.length > 1) {
      let currentChunk = '';
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (currentChunk.length + section.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = section;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + section;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }
    
    // If no sections found or chunks are still too large, split by paragraphs
    if (chunks.length === 0 || chunks.some(chunk => chunk.length > maxChunkSize * 1.2)) {
      chunks.length = 0;
      const paragraphs = text.split(/\n\s*\n/);
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
      
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  // Enhanced semantic search with better matching
  search(query: string, limit: number = 15): KnowledgeChunk[] {
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    
    // Extract key terms (remove common words)
    const stopWords = [
      'the', 'what', 'how', 'when', 'where', 'why', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'this', 'that', 'these', 'those', 'and', 'or', 'but', 'for', 'with', 'about', 'from', 'which', 'who', 'whom',
    ];
    const keyTerms = queryWords.filter(w => !stopWords.includes(w));
    
    // Semantic synonyms mapping
    const semanticMap: Record<string, string[]> = {
      'trajectory': ['trajectory', 'process', 'steps', 'path', 'journey', 'workflow', 'execution'],
      'status': ['status', 'state', 'result', 'outcome', 'mark', 'marking', 'select', 'choose'],
      'error': ['error', 'mistake', 'issue', 'problem', 'fault', 'bug', 'wrong', 'incorrect'],
      'mark': ['mark', 'select', 'choose', 'pick', 'label', 'categorize', 'classify'],
      'output': ['output', 'result', 'summary', 'response', 'answer', 'final'],
      'dissatisfactory': ['dissatisfactory', 'wrong', 'incorrect', 'bad', 'poor', 'unsatisfactory'],
      'early': ['early', 'premature', 'too soon', 'before', 'insufficient'],
      'stopping': ['stopping', 'stopped', 'stop', 'end', 'finish', 'complete'],
      'persistence': ['persistence', 'persistent', 'trying', 'effort', 'attempt'],
      'hallucination': ['hallucination', 'hallucinated', 'imagined', 'made up', 'fake'],
      'ui': ['ui', 'interface', 'button', 'element', 'click', 'interaction'],
      'time': ['time', 'date', 'temporal', 'when', 'schedule'],
      'misunderstanding': ['misunderstanding', 'misunderstood', 'wrong understanding', 'confusion'],
    };
    
    // Expand query with semantic synonyms
    const expandedTerms: string[] = [...keyTerms];
    keyTerms.forEach(term => {
      Object.keys(semanticMap).forEach(key => {
        if (term.includes(key) || semanticMap[key].some(syn => term.includes(syn))) {
          expandedTerms.push(...semanticMap[key]);
        }
      });
    });

    // Detect if query is about trajectory status
    const isTrajectoryQuery = queryLower.includes('trajectory') || 
                              (queryLower.includes('step') && (queryLower.includes('error') || queryLower.includes('mark'))) ||
                              queryLower.includes('trajectory status');

    // Filter out quiz content - chatbot should only use training materials
    const trainingChunks = this.chunks.filter(chunk => chunk.type !== 'quiz');
    
    // Score chunks based on keyword matches (only training materials)
    const scoredChunks = trainingChunks.map((chunk) => {
      const contentLower = chunk.content.toLowerCase();
      const sourceLower = chunk.source.toLowerCase();
      let score = 0;

      // Boost score for trajectory-related chunks when query is about trajectory
      if (isTrajectoryQuery && (contentLower.includes('trajectory status') || contentLower.includes('trajectory'))) {
        score += 150;
      }

      // Exact phrase match gets highest score
      if (contentLower.includes(queryLower)) {
        score += 200;
      }

      // Partial phrase matches (3+ word phrases)
      if (queryWords.length >= 3) {
        const phrase = queryWords.slice(0, 3).join(' ');
        if (contentLower.includes(phrase)) {
          score += 150;
        }
      }

      // Key term matches - also check semantic synonyms
      keyTerms.forEach((term) => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const termRegex = new RegExp(escapedTerm, 'gi');
        const contentMatches = (contentLower.match(termRegex) || []).length;
        const sourceMatches = (sourceLower.match(termRegex) || []).length;
        
        score += contentMatches * 15;
        score += sourceMatches * 30;
        
        // Check for semantic synonyms
        Object.keys(semanticMap).forEach(key => {
          if (term.includes(key) || semanticMap[key].some(syn => term.includes(syn))) {
            semanticMap[key].forEach(synonym => {
              const synonymRegex = new RegExp(synonym, 'gi');
              const synonymContentMatches = (contentLower.match(synonymRegex) || []).length;
              const synonymSourceMatches = (sourceLower.match(synonymRegex) || []).length;
              score += synonymContentMatches * 10;
              score += synonymSourceMatches * 20;
            });
          }
        });
      });

      // All query words present gets bonus
      const allWordsPresent = queryWords.every(word => contentLower.includes(word));
      if (allWordsPresent && queryWords.length > 1) {
        score += 100;
      }

      // Title/source matches get bonus
      if (sourceLower.includes(queryLower)) {
        score += 80;
      }

      // Type-based bonuses
      if (chunk.type === 'document' || chunk.type === 'page') {
        score += 10;
      }

      // Prioritize Trajectory Status content
      if (isTrajectoryQuery) {
        if (contentLower.includes('trajectory status') && 
            (contentLower.includes('marking rules') || 
             contentLower.includes('if task status') ||
             contentLower.includes('success') && contentLower.includes('failure'))) {
          score += 200;
        }
        if (contentLower.includes('trajectory') && contentLower.includes('step')) {
          score += 50;
        }
      }

      return { chunk, score };
    });

    // Sort by score and return top results
    const results = scoredChunks
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.chunk);

    // If no results, try a more lenient search
    if (results.length === 0 && keyTerms.length > 0) {
      const lenientResults = scoredChunks
        .filter((item) => {
          const contentLower = item.chunk.content.toLowerCase();
          return keyTerms.some(term => contentLower.includes(term));
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.chunk);
      
      return lenientResults;
    }

    return results;
  }

  getAllChunks(): KnowledgeChunk[] {
    return this.chunks;
  }

  getChunkById(id: string): KnowledgeChunk | undefined {
    return this.chunks.find((chunk) => chunk.id === id);
  }
}

// Singleton instance - lazy initialization to avoid startup errors
let knowledgeBaseInstance: KnowledgeBaseService | null = null;

export const knowledgeBase = {
  getInstance(): KnowledgeBaseService {
    if (!knowledgeBaseInstance) {
      knowledgeBaseInstance = new KnowledgeBaseService();
    }
    return knowledgeBaseInstance;
  },
  search(query: string, limit?: number): KnowledgeChunk[] {
    return this.getInstance().search(query, limit);
  },
  getAllChunks(): KnowledgeChunk[] {
    return this.getInstance().getAllChunks();
  },
  getChunkById(id: string): KnowledgeChunk | undefined {
    return this.getInstance().getChunkById(id);
  }
};

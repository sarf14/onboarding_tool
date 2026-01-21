// Chat Service - Handles LLM interactions with RAG
import { knowledgeBase, KnowledgeChunk } from './knowledgeBase';
import { config } from '../config/env';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  sources: Array<{ source: string; id: string }>;
  contextUsed: string[];
}

interface LLMAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class ChatService {
  // Detect if user is asking about a real-time scenario (actual error/situation they're facing)
  private detectRealTimeScenario(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const realTimeIndicators = [
      'the model',
      'i\'m seeing',
      'i am seeing',
      'what should i',
      'what do i',
      'how do i mark',
      'should i mark',
      'the task',
      'the error',
      'this error',
      'this situation',
      'in this case',
      'the output',
      'model did',
      'model made',
      'model returned',
      'model failed',
      'model succeeded',
      'i encountered',
      'i found',
      'when evaluating',
      'while evaluating',
      'during evaluation',
      'the trajectory',
      'critical error',
      'task status',
      'trajectory status',
      'what status',
      'which status',
      'mark as',
      'categorize as',
      'classify as',
    ];
    
    return realTimeIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  private async callLLM(messages: ChatMessage[]): Promise<string> {
    const apiKey = config.llm?.apiKey || process.env.DEEPSEEK_API_KEY;
    const apiUrl = config.llm?.apiUrl || 'https://api.deepseek.com';
    const model = config.llm?.model || 'deepseek-chat';

    // Validate configuration
    if (!apiUrl) {
      throw new Error('LLM_API_URL is required. Please set it in your .env file.');
    }
    if (!apiKey && !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1')) {
      throw new Error('LLM_API_KEY or DEEPSEEK_API_KEY is required. Please set it in your .env file.');
    }
    if (!model && !apiUrl.includes('localhost')) {
      throw new Error('LLM_MODEL is required. Please set it in your .env file.');
    }

    // Detect API provider type
    const isOllama = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.includes('ollama');
    const isDeepSeek = apiUrl.includes('deepseek.com') || apiUrl.includes('deepseek');
    
    // Fix DeepSeek URL - append /chat/completions if not present
    let processedApiUrl = apiUrl;
    if (isDeepSeek && !apiUrl.includes('/chat/completions') && !apiUrl.includes('/v1/')) {
      processedApiUrl = apiUrl.endsWith('/') 
        ? `${apiUrl}chat/completions` 
        : `${apiUrl}/chat/completions`;
      console.log(`[LLM] Auto-appended /chat/completions to DeepSeek URL: ${processedApiUrl}`);
    }
    
    console.log(`[LLM] Using API: ${processedApiUrl}`);
    console.log(`[LLM] Model: ${model}`);
    const providerName = isDeepSeek ? 'DeepSeek' : isOllama ? 'Ollama' : 'OpenAI-compatible';
    console.log(`[LLM] Provider: ${providerName}`);

    try {
      const requestBody = {
        model: model,
        messages: messages,
        temperature: 0.5,
        max_tokens: 2000,
        top_p: 0.9,
      };
      
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey && !isOllama) {
        requestHeaders['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Add timeout to fetch (25 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      
      let response;
      try {
        response = await fetch(processedApiUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('LLM API request timed out after 25 seconds');
        }
        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LLM] API error: ${response.status}`);
        console.error(`[LLM] Error details:`, errorText.substring(0, 500));
        throw new Error(`LLM API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const data: any = await response.json();
      const llmResponse = data as LLMAPIResponse;
      return llmResponse.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw error;
    }
  }

  async chat(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    const isRealTime = this.detectRealTimeScenario(userMessage);
    const searchLimit = isRealTime ? 12 : 10;
    const relevantChunks = knowledgeBase.search(userMessage, searchLimit);
    
    if (relevantChunks.length === 0) {
      return {
        message: "I couldn't find specific information about that topic in the training materials. Could you rephrase your question or ask about a specific topic like error categorization, task status, annotation processes, or H2H review?",
        sources: [],
        contextUsed: [],
      };
    }
    
    const context = relevantChunks
      .slice(0, searchLimit)
      .map((chunk, idx) => {
        const isExample = chunk.content.toLowerCase().includes('example') || 
                         chunk.content.toLowerCase().includes('screenshot') ||
                         chunk.content.toLowerCase().includes('explanation') ||
                         chunk.content.toLowerCase().includes('dissatisfactory') ||
                         chunk.content.toLowerCase().includes('output error') ||
                         chunk.source.toLowerCase().includes('example') ||
                         chunk.source.toLowerCase().includes('ec example');
        
        const maxLength = isExample ? 4000 : 2500;
        const content = chunk.content.length > maxLength ? chunk.content.substring(0, maxLength) : chunk.content;
        return `[Source ${idx + 1}: ${chunk.source}]\n${content}`;
      })
      .join('\n\n---\n\n');

    const systemPrompt = `You are a helpful support assistant for the Autonex Annotation & QC Training platform. Your role is to help trainees in TWO ways:

1. Answer questions about the training materials by EXTRACTING and PROVIDING the actual content
2. Help analyze REAL-TIME scenarios where users are evaluating tasks and need guidance on how to handle errors, categorize issues, or determine task status

🚨 CRITICAL: ALWAYS START WITH THE DIRECT ANSWER 🚨
- If user asks "what error should I mark?" → FIRST LINE MUST BE: "You should mark: [ERROR TYPE]"
- If user asks "what is X?" → FIRST LINE MUST BE: "[DEFINITION]"
- DO NOT start with "Based on training materials..." or "Here's what I found..."
- DO NOT start with explanations - START WITH THE ANSWER

MULTILINGUAL SUPPORT:
- Users may ask questions in ANY language (English, Hindi, Spanish, French, etc.)
- ALWAYS understand the question regardless of language
- Respond in the SAME LANGUAGE the user used to ask the question

CRITICAL INSTRUCTIONS FOR TRAINING MATERIAL QUESTIONS:
- DO NOT just reference sources or tell users to "refer to" documents
- EXTRACT and QUOTE the actual definitions, explanations, and examples directly from the context
- PROVIDE the complete information from the documents, not just summaries

CRITICAL INSTRUCTIONS FOR REAL-TIME SCENARIO ANALYSIS:
- When a user describes a real-time error or situation, analyze it using the training materials
- Apply the definitions, rules, and examples from the training materials to the user's specific scenario
- For Trajectory Status questions, FOLLOW THESE STEPS:
  1. First determine Task Status (Success/Failure/Cannot be Determined/Accidental Success) based on the final output
  2. Then apply Trajectory Status rules:
     - If Task Status = Success → Trajectory Status = Success
     - If Task Status = Cannot be Determined → Trajectory Status = Cannot be Determined
     - If Task Status = Failure:
       * If critical error is in LAST STEP ONLY → Trajectory Status = Success
       * If critical error is in MIDDLE/EARLIER steps → Trajectory Status = Failure
- Provide actionable guidance: what error category it is, what task status to mark, what trajectory status to use, etc.

When answering:
- ALWAYS START WITH THE DIRECT ANSWER to the user's question
- Then provide explanation and details from training materials
- Extract and provide the ACTUAL definition from the documents
- Include COMPLETE examples with their explanations from the context
- Quote relevant sections directly from the training materials
- BUT ALWAYS PUT THE ANSWER FIRST - don't bury it in explanations

Context from training materials:
${context}

CRITICAL SEMANTIC MATCHING INSTRUCTIONS:
- Users may use DIFFERENT WORDS/VOCABULARY to ask the SAME question
- Focus on the MEANING and INTENT, not just exact keyword matches
- Match based on SEMANTIC MEANING - understand what they're REALLY asking

🚨🚨🚨 FINAL REMINDER: YOUR FIRST LINE MUST BE THE ANSWER 🚨🚨🚨

${isRealTime ? `THE USER IS ASKING "WHAT ERROR SHOULD I MARK?" OR SIMILAR.

YOUR RESPONSE MUST START WITH: "You should mark: [ERROR TYPE]"

DO NOT START WITH:
- "Based on training materials..."
- "Here's what I found..."
- Any explanation before the answer

CORRECT FORMAT:
Line 1: "You should mark: Time Misunderstanding."
Line 2+: [Then explain why based on training materials]

Respond in the SAME LANGUAGE the user used.` : `THE USER IS ASKING A QUESTION.

YOUR RESPONSE MUST START WITH THE DIRECT ANSWER:
- "what error should I mark?" → "You should mark: [ERROR TYPE]"
- "what is X?" → "[DEFINITION]"

DO NOT START WITH "Based on training materials..." - START WITH THE ANSWER.

Then provide explanation. Focus on semantic meaning - understand what the user is REALLY asking even if they use different words/vocabulary.

Respond in the SAME LANGUAGE the user used.`}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    let response = await this.callLLM(messages);

    // Post-process response to ensure direct answers for error questions
    const userMessageLower = userMessage.toLowerCase();
    const isErrorQuestion = userMessageLower.includes('what error') || 
                           userMessageLower.includes('what should i mark') ||
                           userMessageLower.includes('what error should') ||
                           userMessageLower.includes('which error') ||
                           userMessageLower.includes('error should i') ||
                           (userMessageLower.includes('error') && userMessageLower.includes('mark'));
    
    const shouldPostProcess = isRealTime || isErrorQuestion || 
                              (userMessageLower.includes('error') && 
                               (userMessageLower.includes('mark') || userMessageLower.includes('what')));
    
    if (shouldPostProcess) {
      const responseLower = response.toLowerCase().trim();
      const startsWithAnswer = responseLower.startsWith('you should mark:') || 
                               responseLower.startsWith('you should mark trajectory') ||
                               responseLower.startsWith('mark:');
      
      if (!startsWithAnswer) {
        let errorType = '';
        
        if (userMessageLower.includes('wrong time') || 
            userMessageLower.includes('wrong date') || 
            userMessageLower.includes('time in thoughts') ||
            userMessageLower.includes('date in thoughts')) {
          errorType = 'Time Misunderstanding';
        } else if ((userMessageLower.includes('hallucinated') || userMessageLower.includes('imagined')) && 
                   (userMessageLower.includes('button') || userMessageLower.includes('ui') || 
                    userMessageLower.includes('element'))) {
          errorType = 'UI Hallucination';
        } else if (userMessageLower.includes('wrong output') || 
                   userMessageLower.includes('dissatisfactory') ||
                   userMessageLower.includes('incorrect output')) {
          errorType = 'Dissatisfactory Output';
        } else if (userMessageLower.includes('stopped early') ||
                   userMessageLower.includes('stopped too early') ||
                   userMessageLower.includes('insufficient persistence')) {
          errorType = 'Early Stopping';
        } else if (userMessageLower.includes('hallucinated') && 
                   (userMessageLower.includes('information') || userMessageLower.includes('info'))) {
          errorType = 'Information Hallucination';
        } else if (userMessageLower.includes('misunderstood') && userMessageLower.includes('prompt')) {
          errorType = 'Prompt Misunderstanding';
        }
        
        if (!errorType) {
          const errorTypes = [
            'Time Misunderstanding',
            'UI Hallucination',
            'Dissatisfactory Output',
            'Early Stopping',
            'Information Hallucination',
            'Prompt Misunderstanding',
          ];
          
          for (const et of errorTypes) {
            if (responseLower.includes(et.toLowerCase())) {
              errorType = et;
              break;
            }
          }
        }
        
        if (errorType) {
          response = `You should mark: ${errorType}.\n\n${response}`;
        } else {
          response = `You should mark: [Error Type - see explanation below].\n\n${response}`;
        }
      }
    }

    const sources = relevantChunks.map((chunk) => ({
      source: chunk.source,
      id: chunk.id,
    }));

    const contextUsed = relevantChunks.map((chunk) => chunk.source);

    return {
      message: response,
      sources,
      contextUsed,
    };
  }

  // Fallback response when LLM is not available
  getFallbackResponse(query: string): ChatResponse {
    try {
      const relevantChunks = knowledgeBase.search(query, 3);
      
      if (relevantChunks.length === 0) {
        return {
          message: "I couldn't find specific information about that topic in the training materials. Could you rephrase your question or ask about a specific topic like error categorization, task status, or annotation processes?",
          sources: [],
          contextUsed: [],
        };
      }

      const topChunk = relevantChunks[0];
      const response = `Based on the training materials, here's what I found:\n\n${topChunk.content.substring(0, 500)}...\n\n[Source: ${topChunk.source}]`;

      return {
        message: response,
        sources: relevantChunks.map((chunk) => ({ source: chunk.source, id: chunk.id })),
        contextUsed: relevantChunks.map((chunk) => chunk.source),
      };
    } catch (error) {
      console.error('Fallback search failed:', error);
      return {
        message: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment or contact support if the issue persists.",
        sources: [],
        contextUsed: [],
      };
    }
  }
}

export const chatService = new ChatService();

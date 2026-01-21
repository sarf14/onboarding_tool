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
    const apiKey = config.llm?.apiKey;
    const apiUrl = config.llm?.apiUrl;
    const model = config.llm?.model;

    // Validate configuration
    if (!apiUrl) {
      throw new Error('LLM_API_URL is required. Please set it in your .env file.');
    }
    if (!apiKey && !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1')) {
      throw new Error('LLM_API_KEY is required. Please set it in your .env file.');
    }
    if (!model && !apiUrl.includes('localhost')) {
      throw new Error('LLM_MODEL is required. Please set it in your .env file.');
    }

    // Detect API provider type (only DeepSeek/Ollama/OpenAI-compatible)
    const isOllama = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.includes('ollama');
    const isDeepSeek = apiUrl.includes('deepseek.com') || apiUrl.includes('deepseek');
    
    // Fix DeepSeek URL - append /chat/completions if not present
    let processedApiUrl = apiUrl;
    if (isDeepSeek && !apiUrl.includes('/chat/completions') && !apiUrl.includes('/v1/')) {
      // If URL is just the base domain, append the chat completions endpoint
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
      // ONLY use the configured model - NO GROQ FALLBACKS
      const modelsToTryFinal = [model!];
      
      let lastError: Error | null = null;
      
      for (const modelToUse of modelsToTryFinal) {
        try {
          // Prepare request - OpenAI-compatible format (DeepSeek, Ollama, OpenAI, etc.)
          // Optimized for faster responses: lower max_tokens and temperature
          const requestBody = {
            model: modelToUse,
            messages: messages,
            temperature: 0.5, // Lower temperature for faster, more focused responses
            max_tokens: 2000, // Reduced from 4000 - most responses don't need that much
            top_p: 0.9, // Nucleus sampling for faster generation
          };
          
          const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (apiKey && !isOllama) {
            requestHeaders['Authorization'] = `Bearer ${apiKey}`;
          }
          
          // Add timeout to fetch (25 seconds for LLM calls - reduced for faster feedback)
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
          
          // Success - parse OpenAI-compatible response
          const data: any = await response.json();
          const llmResponse = data as LLMAPIResponse;
          return llmResponse.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
        } catch (error: any) {
          // NO FALLBACKS - throw error immediately
          console.error(`[LLM] Error calling model ${modelToUse}:`, error.message);
          throw error;
        }
      }
      
      // Should never reach here, but just in case
      throw new Error('Failed to call LLM');
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw error;
    }
  }

  async chat(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    // Detect if this is a real-time scenario - if so, search more broadly
    const isRealTime = this.detectRealTimeScenario(userMessage);
    
    // Optimized: Reduced chunk limits for faster responses
    // For real-time scenarios, search more chunks to get comprehensive guidance
    // For training material questions, use standard search
    const searchLimit = isRealTime ? 12 : 10; // Reduced from 20/15 for faster processing
    const relevantChunks = knowledgeBase.search(userMessage, searchLimit);
    
    if (relevantChunks.length === 0) {
      return {
        message: "I couldn't find specific information about that topic in the training materials. Could you rephrase your question or ask about a specific topic like error categorization, task status, annotation processes, or H2H review?",
        sources: [],
        contextUsed: [],
      };
    }
    
    // Build context from relevant chunks - include MUCH more content, especially for examples
    // The LLM will semantically match the user's question to the most relevant chunks
    const context = relevantChunks
      .slice(0, searchLimit) // Limit to top results after semantic evaluation
      .map((chunk, idx) => {
        // For examples with screenshots/explanations, include ALL content
        const isExample = chunk.content.toLowerCase().includes('example') || 
                         chunk.content.toLowerCase().includes('screenshot') ||
                         chunk.content.toLowerCase().includes('explanation') ||
                         chunk.content.toLowerCase().includes('dissatisfactory') ||
                         chunk.content.toLowerCase().includes('output error') ||
                         chunk.source.toLowerCase().includes('example') ||
                         chunk.source.toLowerCase().includes('ec example');
        
        // Optimized: Reduced content length for faster processing
        // Include enough content - up to 4000 chars for examples, 2500 for regular
        const maxLength = isExample ? 4000 : 2500; // Reduced from 8000/5000
        const content = chunk.content.length > maxLength ? chunk.content.substring(0, maxLength) : chunk.content;
        return `[Source ${idx + 1}: ${chunk.source}]\n${content}`;
      })
      .join('\n\n---\n\n');

    // Build system prompt
    const systemPrompt = `You are a helpful support assistant for the Autonex Annotation & QC Training platform. Your role is to help trainees in TWO ways:

1. Answer questions about the training materials by EXTRACTING and PROVIDING the actual content
2. Help analyze REAL-TIME scenarios where users are evaluating tasks and need guidance on how to handle errors, categorize issues, or determine task status

🚨 CRITICAL: ALWAYS START WITH THE DIRECT ANSWER 🚨
- If user asks "what error should I mark?" → FIRST LINE MUST BE: "You should mark: [ERROR TYPE]"
- If user asks "what is X?" → FIRST LINE MUST BE: "[DEFINITION]"
- DO NOT start with "Based on training materials..." or "Here's what I found..."
- DO NOT start with explanations - START WITH THE ANSWER
- Example: "You should mark: Time Misunderstanding." THEN explain why
- Example: "You should mark: UI Hallucination." THEN explain why
- Example: "You should mark: Dissatisfactory Output." THEN explain why

MULTILINGUAL SUPPORT:
- Users may ask questions in ANY language (English, Hindi, Spanish, French, etc.)
- ALWAYS understand the question regardless of language
- Respond in the SAME LANGUAGE the user used to ask the question
- If the user asks in Hindi, respond in Hindi. If they ask in Spanish, respond in Spanish.
- Translate the user's question internally to understand what they're asking about, then provide the answer in their language
- The training materials are in English, but you can explain concepts in any language

CRITICAL INSTRUCTIONS FOR TRAINING MATERIAL QUESTIONS:
- DO NOT just reference sources or tell users to "refer to" documents
- EXTRACT and QUOTE the actual definitions, explanations, and examples directly from the context
- PROVIDE the complete information from the documents, not just summaries
- If the context contains a definition, copy it exactly or paraphrase it fully (translate to user's language if needed)
- If the context contains examples with explanations, include BOTH the example AND its explanation
- Quote directly from the source material when providing definitions (translate to user's language)

CRITICAL INSTRUCTIONS FOR REAL-TIME SCENARIO ANALYSIS:
- When a user describes a real-time error or situation (e.g., "The model did X", "I'm seeing Y error", "What should I mark if..."), analyze it using the training materials
- Apply the definitions, rules, and examples from the training materials to the user's specific scenario
- For Trajectory Status questions, FOLLOW THESE STEPS:
  1. First determine Task Status (Success/Failure/Cannot be Determined/Accidental Success) based on the final output
  2. Then apply Trajectory Status rules:
     - If Task Status = Success → Trajectory Status = Success
     - If Task Status = Cannot be Determined → Trajectory Status = Cannot be Determined
     - If Task Status = Failure:
       * If critical error is in LAST STEP ONLY → Trajectory Status = Success
       * If critical error is in MIDDLE/EARLIER steps → Trajectory Status = Failure
- For questions about "repeatedly wrong output" or "many times wrong output":
  * If the model stops too early without trying hard enough → Early Stopping (Insufficient Persistence)
  * If the final output is consistently wrong → Dissatisfactory Output (if error is in final step)
  * If errors occur throughout the process → Identify the Critical Error (root cause) - could be UI Hallucination, Information Hallucination, Time Misunderstanding, etc.
  * Always identify WHERE the error occurred (which step) and WHAT type of error it is
- Provide actionable guidance: what error category it is, what task status to mark, what trajectory status to use, etc.
- Reference the relevant training material rules that apply to this scenario
- If the scenario matches an example from the training materials, cite that example
- Be specific and practical - tell them exactly what to do based on the training materials
- ALWAYS apply the rules step-by-step - don't skip the Task Status determination
- When multiple errors occur, identify the CRITICAL ERROR (the root cause that led to failure)

When answering:
- ALWAYS START WITH THE DIRECT ANSWER to the user's question
- If they ask "what error should I mark?" → Start with "You should mark: [ERROR TYPE]"
- If they ask "what is X?" → Start with the definition
- Then provide explanation and details from training materials
- Extract and provide the ACTUAL definition from the documents (don't just say "it's defined in source X")
- Include COMPLETE examples with their explanations from the context
- Quote relevant sections directly from the training materials
- For real-time scenarios, apply the training material knowledge to provide specific guidance
- Be thorough - include all details, not just a summary
- BUT ALWAYS PUT THE ANSWER FIRST - don't bury it in explanations

Context from training materials:
${context}

CRITICAL SEMANTIC MATCHING INSTRUCTIONS:
- Users may use DIFFERENT WORDS/VOCABULARY to ask the SAME question
- Focus on the MEANING and INTENT, not just exact keyword matches
- Examples: "how do I mark trajectory?" = "what is trajectory status?" = "what should I select for trajectory?"
- Examples: "model gave wrong result" = "dissatisfactory output" = "incorrect output"
- Examples: "model stopped early" = "early stopping" = "insufficient persistence"
- Match based on SEMANTIC MEANING - understand what they're REALLY asking
- Use the context above to find relevant information even if vocabulary differs

🚨🚨🚨 FINAL REMINDER: YOUR FIRST LINE MUST BE THE ANSWER 🚨🚨🚨

${isRealTime ? `THE USER IS ASKING "WHAT ERROR SHOULD I MARK?" OR SIMILAR.

YOUR RESPONSE MUST START WITH: "You should mark: [ERROR TYPE]"

DO NOT START WITH:
- "Based on training materials..."
- "Here's what I found..."
- "According to the training materials..."
- Any explanation before the answer

CORRECT FORMAT:
Line 1: "You should mark: Time Misunderstanding."
Line 2+: [Then explain why based on training materials]

For Trajectory Status questions:
Line 1: "You should mark Trajectory Status as: [Success/Failure]"
Line 2+: [Then explain why]

Common Error Types:
- Time Misunderstanding (wrong time/date in thoughts)
- UI Hallucination (imagined UI element)
- Dissatisfactory Output (wrong output)
- Early Stopping (stopped too early)
- Information Hallucination (made up info)
- Prompt Misunderstanding (misunderstood task)

Respond in the SAME LANGUAGE the user used.` : `THE USER IS ASKING A QUESTION.

YOUR RESPONSE MUST START WITH THE DIRECT ANSWER:
- "what error should I mark?" → "You should mark: [ERROR TYPE]"
- "what is X?" → "[DEFINITION]"

DO NOT START WITH "Based on training materials..." - START WITH THE ANSWER.

Then provide explanation. Focus on semantic meaning - understand what the user is REALLY asking even if they use different words/vocabulary.

Respond in the SAME LANGUAGE the user used.`}`;

    // Build messages - optimized: reduced history for faster responses
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4), // Reduced from 8 to 4 messages for faster processing
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Call LLM with increased max_tokens for better responses
    let response = await this.callLLM(messages);

    // Post-process response to ensure direct answers for error questions
    const userMessageLower = userMessage.toLowerCase();
    const isErrorQuestion = userMessageLower.includes('what error') || 
                           userMessageLower.includes('what should i mark') ||
                           userMessageLower.includes('what error should') ||
                           userMessageLower.includes('which error') ||
                           userMessageLower.includes('error should i') ||
                           (userMessageLower.includes('error') && userMessageLower.includes('mark')) ||
                           userMessageLower.includes('what error') ||
                           userMessageLower.includes('error') && userMessageLower.includes('should');
    
    // ALWAYS post-process if it's an error question OR real-time scenario
    // Make this check more aggressive - if question contains "error" and asks what to mark, ALWAYS process
    const shouldPostProcess = isRealTime || isErrorQuestion || 
                              (userMessageLower.includes('error') && 
                               (userMessageLower.includes('mark') || userMessageLower.includes('what')));
    
    if (shouldPostProcess) {
      console.log('[Post-processing] Triggered for:', userMessage.substring(0, 50));
      console.log('[Post-processing] isRealTime:', isRealTime, 'isErrorQuestion:', isErrorQuestion);
      const responseLower = response.toLowerCase().trim();
      const startsWithAnswer = responseLower.startsWith('you should mark:') || 
                               responseLower.startsWith('you should mark trajectory') ||
                               responseLower.startsWith('mark:');
      
      console.log('[Post-processing] Response starts with answer?', startsWithAnswer);
      console.log('[Post-processing] First 100 chars of response:', response.substring(0, 100));
      
      if (!startsWithAnswer) {
        // Pattern matching from user message FIRST (most reliable)
        let errorType = '';
        
        // Time-related errors
        if (userMessageLower.includes('wrong time') || 
            userMessageLower.includes('wrong date') || 
            userMessageLower.includes('time in thoughts') ||
            userMessageLower.includes('date in thoughts') ||
            userMessageLower.includes('incorrect time') ||
            userMessageLower.includes('incorrect date')) {
          errorType = 'Time Misunderstanding';
        }
        // UI Hallucination
        else if ((userMessageLower.includes('hallucinated') || userMessageLower.includes('imagined')) && 
                 (userMessageLower.includes('button') || userMessageLower.includes('ui') || 
                  userMessageLower.includes('element') || userMessageLower.includes('field'))) {
          errorType = 'UI Hallucination';
        }
        // Dissatisfactory Output
        else if (userMessageLower.includes('wrong output') || 
                 userMessageLower.includes('dissatisfactory') ||
                 userMessageLower.includes('incorrect output') ||
                 userMessageLower.includes('bad output')) {
          errorType = 'Dissatisfactory Output';
        }
        // Early Stopping
        else if (userMessageLower.includes('stopped early') ||
                 userMessageLower.includes('stopped too early') ||
                 userMessageLower.includes('insufficient persistence') ||
                 userMessageLower.includes('gave up')) {
          errorType = 'Early Stopping';
        }
        // Information Hallucination
        else if (userMessageLower.includes('hallucinated') && 
                 (userMessageLower.includes('information') || userMessageLower.includes('info') ||
                  userMessageLower.includes('data') || userMessageLower.includes('text'))) {
          errorType = 'Information Hallucination';
        }
        // Prompt Misunderstanding
        else if (userMessageLower.includes('misunderstood') && userMessageLower.includes('prompt')) {
          errorType = 'Prompt Misunderstanding';
        }
        
        // If no match from user message, try to extract from response
        if (!errorType) {
          const errorTypes = [
            'Time Misunderstanding',
            'UI Hallucination',
            'Dissatisfactory Output',
            'Early Stopping',
            'Information Hallucination',
            'Prompt Misunderstanding',
            'Insufficient Persistence',
          ];
          
          for (const et of errorTypes) {
            if (responseLower.includes(et.toLowerCase())) {
              errorType = et;
              break;
            }
          }
        }
        
        // Always prepend direct answer if we have error type or if it's an error question
        if (errorType) {
          console.log('[Post-processing] Prepending answer:', errorType);
          response = `You should mark: ${errorType}.\n\n${response}`;
        } else {
          // Even if we can't determine, force the format for error questions
          console.log('[Post-processing] Forcing answer format - no error type found');
          response = `You should mark: [Error Type - see explanation below].\n\n${response}`;
        }
      } else {
        console.log('[Post-processing] Response already starts with answer');
      }
    } else {
      console.log('[Post-processing] Not triggered - isRealTime:', isRealTime, 'isErrorQuestion:', isErrorQuestion, 'userMessage:', userMessage.substring(0, 50));
    }

    // Extract sources
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

      // Create a simple response from the most relevant chunk
      const topChunk = relevantChunks[0];
      const response = `Based on the training materials, here's what I found:\n\n${topChunk.content.substring(0, 500)}...\n\n[Source: ${topChunk.source}]`;

      return {
        message: response,
        sources: relevantChunks.map((chunk) => ({ source: chunk.source, id: chunk.id })),
        contextUsed: relevantChunks.map((chunk) => chunk.source),
      };
    } catch (error) {
      // If search fails, return a basic error message
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

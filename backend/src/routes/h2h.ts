// H2H (Head-to-Head) Writing Tool routes - Exact replica of FastAPI logic
import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { config } from '../config/env';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

interface FormatRequest {
  type: string;
  preference: string;
  key_req: string;
  supp_info: string;
  extra: string;
}

// POST /api/h2h/format - Format H2H comparison text (exact FastAPI logic)
router.post('/format', async (req: AuthRequest, res) => {
  try {
    const { type, preference, key_req, supp_info, extra } = req.body as FormatRequest;

    const type_ = (type || '').trim();
    const preference_ = (preference || '').trim();
    
    // Clean inputs and remove "Model A" or "Model B" prefixes to avoid duplication
    const cleanModelPrefix = (text: string): string => {
      return text
        .replace(/^Model\s+[AB]\s+/i, '') // Remove "Model A " or "Model B " at start
        .replace(/^model\s+[ab]\s+/i, '') // Remove lowercase version
        .trim();
    };
    
    const key_req_ = cleanModelPrefix((key_req || '').trim());
    const supp_info_ = cleanModelPrefix((supp_info || '').trim());
    const extra_ = cleanModelPrefix((extra || '').trim());

    if (!(key_req_ || supp_info_ || extra_)) {
      return res.status(400).json({ error: 'Empty text' });
    }

    if ((key_req_.length + supp_info_.length + extra_.length) > 2000) {
      return res.status(400).json({ error: 'Input too long (max 2000 chars)' });
    }

    // Determine model names and preference strength
    const preferenceMap: Record<string, [string, string, string]> = {
      'Model A Strongly': ['A', 'B', 'strongly'],
      'Model A Slightly': ['A', 'B', 'slightly'],
      'Neutral': ['A', 'B', 'neutral'],
      'Model B Slightly': ['B', 'A', 'slightly'],
      'Model B Strongly': ['B', 'A', 'strongly'],
      'Unsure': ['A', 'B', 'unsure'],
    };

    const [model, other_model, strength] = preferenceMap[preference_] || ['A', 'B', 'neutral'];

    // --- Supplementary info handling ---
    // Detect if "both" or similar terms are used, or if it's clear that both models provided info
    const both_supplementary = [
      'both',
      'each model',
      'all models',
      'model a and model b'
    ].some(phrase => supp_info_.toLowerCase().includes(phrase));

    // --- Template Construction ---
    let template = '';

    if (strength === 'neutral') {
      const parts: string[] = [];
      
      if (key_req_) {
        parts.push(`In terms of key requirements, ${key_req_}`);
      }
      if (supp_info_) {
        parts.push(`In terms of supplementary information, ${supp_info_}`);
      }
      if (extra_) {
        const prefix = type_ === 'Process Performance' ? 'In terms of process' : 'In terms of formatting';
        parts.push(`${prefix}, ${extra_}`);
      }
      
      template = 
        `${parts.join('. ')}.\n` +
        `Therefore, there is no clear advantage between Model A and Model B.\n\n` +
        `Polish this text for grammar and clarity only. Keep it neutral, factual, and concise.\n\n` +
        ` Balanced tone\n Neutral phrasing\n Human-sounding clarity\n Zero format drift`;
    } else if (strength === 'unsure') {
      // Build the reason for uncertainty using all available fields with appropriate prefixes
      let uncertaintyReason = '';
      const reasons: string[] = [];
      
      if (key_req_) {
        reasons.push(`in terms of key requirements, ${key_req_}`);
      }
      if (supp_info_) {
        reasons.push(`in terms of supplementary information, ${supp_info_}`);
      }
      if (extra_) {
        const prefix = type_ === 'Process Performance' ? 'in terms of process' : 'in terms of formatting';
        reasons.push(`${prefix}, ${extra_}`);
      }
      
      if (reasons.length > 0) {
        // Join reasons with proper punctuation and conjunctions
        if (reasons.length === 1) {
          uncertaintyReason = reasons[0];
        } else if (reasons.length === 2) {
          uncertaintyReason = `${reasons[0]} and ${reasons[1]}`;
        } else {
          uncertaintyReason = reasons.slice(0, -1).join(', ') + ', and ' + reasons[reasons.length - 1];
        }
      } else {
        uncertaintyReason = 'unclear or missing evaluation details';
      }
      
      template = 
        `The comparison could not be completed due to ${uncertaintyReason}.\n` +
        `Therefore, it cannot be determined whether Model A or Model B performed better.\n\n` +
        `Polish this text for grammar and clarity only. Keep it factual and formal.\n\n` +
        ` Neutral tone\n Proper formatting\n Human-sounding clarity\n Clear closing statement`;
    } else if (type_ === 'Process Performance') {
      const parts: string[] = [];
      
      if (key_req_) {
        parts.push(`In terms of key requirements, ${key_req_}`);
      }
      if (supp_info_) {
        parts.push(`In terms of supplementary information, ${supp_info_}`);
      }
      if (extra_) {
        parts.push(`In terms of process, ${extra_}`);
      }

      template = 
        `${parts.join('. ')}.\n` +
        `Therefore, Model ${model} is ${strength} better than Model ${other_model} in process performance.\n\n` +
        `Polish this text for grammar and clarity only. Correct grammar errors, restructure sentences appropriately, and improve vocabulary. Do not change structure or format.\n\n` +
        ` Consistent structure\n Perfect grammar\n Human-sounding clarity\n Zero format drift`;
    } else {
      // Outcome Performance
      const parts: string[] = [];
      
      if (key_req_) {
        parts.push(`In terms of key requirements, ${key_req_}`);
      }
      if (supp_info_) {
        parts.push(`In terms of supplementary information, ${supp_info_}`);
      }
      if (extra_) {
        parts.push(`In terms of formatting, ${extra_}`);
      }

      template = 
        `${parts.join('. ')}.\n` +
        `Therefore, Model ${model} is ${strength} better than Model ${other_model} in outcome performance.\n\n` +
        `Polish this text for grammar and clarity only. Correct grammar errors, restructure sentences appropriately, and improve vocabulary. Do not change structure or format.\n\n` +
        ` Consistent structure\n Perfect grammar\n Human-sounding clarity\n Zero format drift`;
    }

    // --- Send to DeepSeek API ---
    try {
      const llmConfig = config.llm;
      if (!llmConfig.apiKey) {
        return res.json({ formatted: template });
      }

      console.log(' Using DeepSeek API...');
      const deepseekUrl = llmConfig.apiUrl || 'https://api.deepseek.com/chat/completions';
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${llmConfig.apiKey}`,
        'Content-Type': 'application/json',
      };

      const data = {
        model: llmConfig.model || 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional writing assistant.' 
          },
          { 
            role: 'user', 
            content: `Polish this text for grammar and clarity only. Correct grammar errors, restructure sentences appropriately, and improve vocabulary:\n\n${template}` 
          }
        ],
        temperature: 0.4,
        max_tokens: 500,
      };

      const response = await fetch(deepseekUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000), // 20 second timeout for faster feedback
      });

      if (response.ok) {
        const result = await response.json() as any;
        let polished = result.choices?.[0]?.message?.content?.trim() || template;
        
        // Remove instruction lines from output
        const instructionPatterns = [
          /Polish this text for grammar and clarity only[^\n]*/gi,
          /Rewrite this text completely[^\n]*/gi,
          /Rewrite this text with improved structure[^\n]*/gi,
          /Fix ALL grammar errors[^\n]*/gi,
          /Fix ALL grammar errors, typos[^\n]*/gi,
          /Keep it[^\n]*/gi,
          /Rephrase for grammar and clarity only[^\n]*/gi,
          /Do not change structure or format[^\n]*/gi,
          /Do not copy-paste[^\n]*/gi,
          /Enhance word choice and sentence flow[^\n]*/gi,
          /Use proper conjunctions[^\n]*/gi,
          /Use professional language and better word choices[^\n]*/gi,
          /Make it professional, clear[^\n]*/gi,
          /Balanced tone/gi,
          /Neutral phrasing/gi,
          /Human-sounding clarity/gi,
          /Zero format drift/gi,
          /Consistent structure/gi,
          /Perfect grammar/gi,
          /Neutral tone/gi,
          /Proper formatting/gi,
          /Clear closing statement/gi,
        ];
        
        instructionPatterns.forEach(pattern => {
          polished = polished.replace(pattern, '').trim();
        });
        
        // Clean up multiple newlines
        polished = polished.replace(/\n{3,}/g, '\n\n').trim();
        
        return res.json({ formatted: polished || template });
      }
    } catch (error) {
      console.error(' DeepSeek API error:', error);
      return res.json({ formatted: template });
    }

    // Fallback if API call didn't return - remove instructions from template
    let cleanedTemplate = template;
    const instructionPatterns = [
      /Polish this text for grammar and clarity only[^\n]*/gi,
      /Rewrite this text completely[^\n]*/gi,
      /Rewrite this text with improved structure[^\n]*/gi,
      /Fix ALL grammar errors[^\n]*/gi,
      /Fix ALL grammar errors, typos[^\n]*/gi,
      /Keep it[^\n]*/gi,
      /Rephrase for grammar and clarity only[^\n]*/gi,
      /Do not change structure or format[^\n]*/gi,
      /Do not copy-paste[^\n]*/gi,
      /Enhance word choice and sentence flow[^\n]*/gi,
      /Use proper conjunctions[^\n]*/gi,
      /Use professional language and better word choices[^\n]*/gi,
      /Make it professional, clear[^\n]*/gi,
      /Balanced tone/gi,
      /Neutral phrasing/gi,
      /Human-sounding clarity/gi,
      /Zero format drift/gi,
      /Consistent structure/gi,
      /Perfect grammar/gi,
      /Neutral tone/gi,
      /Proper formatting/gi,
      /Clear closing statement/gi,
    ];
    
    instructionPatterns.forEach(pattern => {
      cleanedTemplate = cleanedTemplate.replace(pattern, '').trim();
    });
    
    cleanedTemplate = cleanedTemplate.replace(/\n{3,}/g, '\n\n').trim();
    
    return res.json({ formatted: cleanedTemplate });
  } catch (error: any) {
    console.error('H2H format error:', error);
    res.status(500).json({ 
      error: 'Failed to format H2H text', 
      details: error.message 
    });
  }
});

export default router;

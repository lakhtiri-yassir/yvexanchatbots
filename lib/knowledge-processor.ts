/**
 * Knowledge Base Processor
 * 
 * Intelligently categorizes knowledge base files and constructs
 * context-aware prompts based on user intent.
 */

import { IntentType } from './intent-detector';

export type FileCategory = 'instruction_template' | 'factual_knowledge' | 'unknown';

export interface InstructionTemplate {
  systemRules: string;
  userPromptTemplate: string;
  responseFormat: string;
  examples: string[];
}

/**
 * Categorizes a knowledge base file based on its content
 * @param filename - Name of the file
 * @param content - File content
 * @returns The category of the file
 */
export function categorizeKnowledgeFile(filename: string, content: string): FileCategory {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  // Strong indicators of instruction templates
  const instructionIndicators = [
    '{insert',
    '{user',
    'user prompt template',
    'system prompt template',
    'generate 5',
    'guidelines:',
    'you are kevin box',
    'rules:',
    'must be',
    'tone must be',
    'avoid emojis',
    'example:',
    'match the tone of these examples',
  ];
  
  // Filename indicators
  const instructionFilenames = [
    'instruction',
    'template',
    'prompt',
    'framework',
    'guide',
    'rules',
  ];
  
  // Check content for instruction indicators
  let instructionScore = 0;
  for (const indicator of instructionIndicators) {
    if (lowerContent.includes(indicator)) {
      instructionScore++;
    }
  }
  
  // Check filename for instruction indicators
  for (const indicator of instructionFilenames) {
    if (lowerFilename.includes(indicator)) {
      instructionScore += 2;
    }
  }
  
  // If strong instruction signals, categorize as template
  if (instructionScore >= 3) {
    return 'instruction_template';
  }
  
  // Otherwise, assume factual knowledge
  if (content.length > 50) {
    return 'factual_knowledge';
  }
  
  return 'unknown';
}

/**
 * Extracts structured instruction template from raw content
 * @param content - Raw instruction file content
 * @returns Structured instruction template
 */
export function extractInstructionTemplate(content: string): InstructionTemplate {
  const template: InstructionTemplate = {
    systemRules: '',
    userPromptTemplate: '',
    responseFormat: '',
    examples: [],
  };
  
  // Extract system rules (usually at the beginning)
  const systemRulesMatch = content.match(/You are .+?(?=\n\n|\nUser Prompt|Generate|$)/s);
  if (systemRulesMatch) {
    template.systemRules = systemRulesMatch[0].trim();
  }
  
  // Extract user prompt template section
  const userPromptMatch = content.match(/(?:User Prompt Template:|Generate .+? for the following post)[:\s]+(.+?)(?=\n\n[A-Z]|$)/s);
  if (userPromptMatch) {
    template.userPromptTemplate = userPromptMatch[1].trim();
  }
  
  // Extract response format guidelines
  const responseFormatMatch = content.match(/(?:Response Format|Guidelines|Output):[:\s]+(.+?)(?=\n\n[A-Z]|$)/s);
  if (responseFormatMatch) {
    template.responseFormat = responseFormatMatch[1].trim();
  }
  
  // Extract examples (numbered or bulleted)
  const examplesMatch = content.match(/(?:Examples?|Match the tone of these examples):[:\s]+(.+?)(?=\n\n[A-Z]|Post:|$)/s);
  if (examplesMatch) {
    const examplesText = examplesMatch[1];
    const exampleLines = examplesText.split(/\n/).filter(line => 
      /^\s*[\d\-\*]/.test(line) && line.trim().length > 10
    );
    template.examples = exampleLines.map(line => line.replace(/^\s*[\d\-\*\.]+\s*/, '').trim());
  }
  
  return template;
}

/**
 * Builds a contextual system prompt based on intent and available resources
 * @param intent - Detected user intent
 * @param templates - Extracted instruction templates
 * @param knowledge - Factual knowledge base content
 * @param userMessage - The user's original message
 * @param basePrompt - The chatbot's configured base prompt
 * @returns Contextual system prompt
 */
export function buildContextualPrompt(
  intent: IntentType,
  templates: InstructionTemplate[],
  knowledge: string[],
  userMessage: string,
  basePrompt: string
): string {
  // For normal conversation, use base prompt + factual knowledge only
  if (intent === 'normal_conversation') {
    let prompt = basePrompt || 'You are a helpful AI assistant.';
    
    if (knowledge.length > 0) {
      prompt += '\n\nYou have access to the following knowledge base:\n' + knowledge.join('\n\n');
    }
    
    return prompt;
  }
  
  // For framework-based intents, use instruction templates
  if (templates.length > 0) {
    const template = templates[0]; // Use first template found
    
    let prompt = '';
    
    // Add system rules
    if (template.systemRules) {
      prompt += template.systemRules + '\n\n';
    } else {
      // Fallback system rules
      prompt += "You are Kevin Box's AI content strategist, trained to create viral hooks and rewrite posts in Kevin's bold, pithy, and no-nonsense style.\n\n";
      prompt += "Rules:\n";
      prompt += "- Avoid emojis, filler, or politeness.\n";
      prompt += "- Tone must be confident, emotionally charged, and attention-grabbing.\n";
      prompt += "- Hooks and rewrites must evoke curiosity, fear, surprise, or identity.\n\n";
    }
    
    // Add task-specific instructions
    if (intent === 'hook_generation') {
      prompt += "Generate 5 viral hooks for the following post.\n\n";
      prompt += "Guidelines:\n";
      prompt += "- Hooks must be 10-20 words, pithy, bold, and emotionally charged.\n";
      prompt += "- Use curiosity, fear, and surprise to drive attention.\n";
      prompt += "- Number them 1-5.\n";
      prompt += "- Do not include any preamble or explanation, just the 5 hooks.\n\n";
      
      if (template.examples.length > 0) {
        prompt += "Match the tone of these examples:\n";
        template.examples.forEach((example, i) => {
          prompt += `${i + 1}. ${example}\n`;
        });
        prompt += '\n';
      }
    } else if (intent === 'post_rewrite') {
      prompt += "Rewrite the following post in Kevin Box's viral style.\n\n";
      prompt += "Guidelines:\n";
      prompt += "- Make it bold, pithy, and emotionally charged.\n";
      prompt += "- Evoke curiosity, fear, or surprise.\n";
      prompt += "- Remove filler words and politeness.\n";
      prompt += "- Make every word count.\n";
      prompt += "- Do not include any preamble or explanation, just the rewritten post.\n\n";
    }
    
    return prompt;
  }
  
  // Fallback if no templates found but intent is framework-related
  return basePrompt || 'You are a helpful AI assistant.';
}

/**
 * Cleans AI response to remove meta-commentary and formatting issues
 * @param response - Raw AI response
 * @param intent - The user's intent
 * @returns Cleaned response
 */
export function cleanResponse(response: string, intent: IntentType): string {
  let cleaned = response.trim();
  
  // Remove common meta-commentary prefixes
  const metaPrefixes = [
    /^Here are .+?:\n+/i,
    /^Here's .+?:\n+/i,
    /^Sure.+?:\n+/i,
    /^I've .+?:\n+/i,
    /^Based on .+?:\n+/i,
  ];
  
  for (const prefix of metaPrefixes) {
    cleaned = cleaned.replace(prefix, '');
  }
  
  // For hook generation, ensure clean numbered list
  if (intent === 'hook_generation') {
    // Remove any text before first numbered item
    const firstNumberMatch = cleaned.match(/^[\s\S]*?(1[\.\)]\s)/);
    if (firstNumberMatch) {
      const startIndex = cleaned.indexOf(firstNumberMatch[1]);
      cleaned = cleaned.substring(startIndex);
    }
    
    // Remove any text after last numbered item (5)
    const lines = cleaned.split('\n');
    const lastHookIndex = lines.findIndex(line => /^5[\.\)]\s/.test(line));
    if (lastHookIndex !== -1) {
      // Include the line with hook 5 and potentially one more line if it's a continuation
      cleaned = lines.slice(0, lastHookIndex + 2).join('\n');
    }
  }
  
  return cleaned.trim();
}
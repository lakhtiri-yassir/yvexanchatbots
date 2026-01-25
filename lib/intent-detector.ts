/**
 * Intent Detection Library
 * 
 * Analyzes user messages to determine conversational intent:
 * - Hook generation (user wants viral hooks for their post)
 * - Post rewrite (user wants post improved in Kevin Box style)
 * - Normal conversation (general chatbot interaction)
 */

export type IntentType = 'hook_generation' | 'post_rewrite' | 'normal_conversation';

/**
 * Detects the user's intent from their message
 * @param message - The user's input message
 * @returns The detected intent type
 */
export function detectIntent(message: string): IntentType {
  const lowerMessage = message.toLowerCase().trim();
  
  // Hook generation triggers
  const hookTriggers = [
    'generate hook',
    'create hook',
    'write hook',
    'give me hook',
    'make hook',
    'viral hook',
    'hook for',
    'hooks for',
    'generate 5 hook',
  ];
  
  // Post rewrite triggers
  const rewriteTriggers = [
    'rewrite',
    'improve this',
    'make this better',
    'enhance this',
    'rephrase',
    'polish this',
    'fix this post',
    'improve my post',
  ];
  
  // Check for hook generation intent
  for (const trigger of hookTriggers) {
    if (lowerMessage.includes(trigger)) {
      return 'hook_generation';
    }
  }
  
  // Check for post rewrite intent
  for (const trigger of rewriteTriggers) {
    if (lowerMessage.includes(trigger)) {
      return 'post_rewrite';
    }
  }
  
  // Default to normal conversation
  return 'normal_conversation';
}

/**
 * Extracts the actual post content from a user message
 * Handles various formats like "Generate hooks for: [post]" or "Rewrite this: [post]"
 * @param message - The user's input message
 * @returns The extracted post content, or null if not found
 */
export function extractPostContent(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Common separators that indicate "here's my post content"
  const separators = [
    'for:',
    'for this:',
    'for the following:',
    'this:',
    'this post:',
    'my post:',
    '---',
    '\n\n',
  ];
  
  // Try to find content after separator
  for (const separator of separators) {
    const index = lowerMessage.indexOf(separator);
    if (index !== -1) {
      const content = message.substring(index + separator.length).trim();
      if (content.length > 10) { // Minimum viable post length
        return content;
      }
    }
  }
  
  // If message is long enough and contains intent keywords,
  // assume everything after first sentence is the post
  if (message.length > 100) {
    const firstSentenceEnd = Math.max(
      message.indexOf('. '),
      message.indexOf('? '),
      message.indexOf('! ')
    );
    
    if (firstSentenceEnd > 0 && firstSentenceEnd < 100) {
      const possiblePost = message.substring(firstSentenceEnd + 2).trim();
      if (possiblePost.length > 20) {
        return possiblePost;
      }
    }
  }
  
  // If no clear separator, but message is substantial, return whole message
  // (Let the AI figure it out)
  if (message.length > 50) {
    return message;
  }
  
  return null;
}

/**
 * Determines if a message likely contains a post to analyze
 * @param message - The user's input message
 * @returns True if message appears to contain post content
 */
export function hasPostContent(message: string): boolean {
  const content = extractPostContent(message);
  return content !== null && content.length > 20;
}
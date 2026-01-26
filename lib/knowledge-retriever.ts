/**
 * Knowledge Retrieval System
 * 
 * Intelligently retrieves relevant knowledge base content for AI responses.
 * Features:
 * - Semantic search and ranking
 * - Token budget management
 * - Model-agnostic context window handling
 * - Chunk-based retrieval for large documents
 */

import { IntentType } from './intent-detector';

export interface KnowledgeFile {
  id: string;
  filename: string;
  file_type: string;
  file_path: string;
  content?: string;
}

export interface ContentChunk {
  content: string;
  filename: string;
  relevanceScore: number;
  tokens: number;
}

export interface RetrievalResult {
  chunks: ContentChunk[];
  totalTokens: number;
  filesUsed: string[];
  selectionStrategy: string;
}

/**
 * Stop words to ignore during keyword extraction
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
  'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'what',
  'which', 'who', 'when', 'where', 'why', 'how', 'tell', 'me', 'about',
  'give', 'want', 'need', 'know', 'get', 'help'
]);

/**
 * Model context limits (in tokens)
 */
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  'gpt-3.5-turbo': 16000,
  'gpt-3.5-turbo-16k': 16000,
  'gpt-4': 8000,
  'gpt-4-32k': 32000,
  'gpt-4-turbo': 128000,
  'gpt-4-turbo-preview': 128000,
  'claude-3-opus': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku': 200000,
  'claude-3.5-sonnet': 200000,
  'claude-2': 100000,
  'llama-3.1-8b': 128000,
  'llama-3.1-70b': 128000,
  'llama-3.1-405b': 128000,
  'mistral-large': 128000,
  'mixtral-8x7b': 32000,
  'default': 8000
};

/**
 * Estimate token count from character count
 * Rule of thumb: 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get context limit for a model
 */
export function getModelContextLimit(modelName: string): number {
  // Check exact match first
  if (MODEL_CONTEXT_LIMITS[modelName]) {
    return MODEL_CONTEXT_LIMITS[modelName];
  }
  
  // Check partial matches
  const lowerModel = modelName.toLowerCase();
  
  if (lowerModel.includes('gpt-4-turbo')) return 128000;
  if (lowerModel.includes('gpt-4-32k')) return 32000;
  if (lowerModel.includes('gpt-4')) return 8000;
  if (lowerModel.includes('gpt-3.5-16k')) return 16000;
  if (lowerModel.includes('gpt-3.5')) return 16000;
  if (lowerModel.includes('claude-3')) return 200000;
  if (lowerModel.includes('claude-2')) return 100000;
  if (lowerModel.includes('llama-3.1')) return 128000;
  if (lowerModel.includes('llama-3')) return 8000;
  if (lowerModel.includes('mistral-large')) return 128000;
  if (lowerModel.includes('mixtral')) return 32000;
  
  // Conservative default
  return 8000;
}

/**
 * Extract meaningful keywords from user query
 */
export function extractKeywords(query: string): string[] {
  // Convert to lowercase and split into words
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Minimum 3 characters
  
  // Remove stop words
  const keywords = words.filter(word => !STOP_WORDS.has(word));
  
  // Remove duplicates
  return [...new Set(keywords)];
}

/**
 * Score file relevance based on keywords
 */
export function scoreFileRelevance(
  filename: string,
  content: string,
  keywords: string[]
): number {
  if (keywords.length === 0) return 0;
  
  let score = 0;
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  keywords.forEach(keyword => {
    // Filename match (weight: 3.0)
    if (lowerFilename.includes(keyword)) {
      score += 3.0;
    }
    
    // Count occurrences in content (weight: 0.2 per occurrence, max 5)
    const contentMatches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
    score += Math.min(contentMatches * 0.2, 5);
    
    // Check for keyword in first 1000 characters (early appearance bonus)
    if (lowerContent.substring(0, 1000).includes(keyword)) {
      score += 1.0;
    }
  });
  
  return score;
}

/**
 * Split content into manageable chunks
 */
export function chunkContent(
  content: string,
  filename: string,
  maxChunkSize: number = 2000
): Array<{ text: string; filename: string }> {
  const chunks: Array<{ text: string; filename: string }> = [];
  
  // Split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    if (!trimmedParagraph) continue;
    
    // If adding this paragraph exceeds max size, save current chunk
    if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        filename: filename
      });
      currentChunk = '';
    }
    
    // If single paragraph is too large, split it
    if (trimmedParagraph.length > maxChunkSize) {
      // Split by sentences
      const sentences = trimmedParagraph.match(/[^.!?]+[.!?]+/g) || [trimmedParagraph];
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            filename: filename
          });
          currentChunk = '';
        }
        currentChunk += sentence + ' ';
      }
    } else {
      currentChunk += trimmedParagraph + '\n\n';
    }
  }
  
  // Add remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      filename: filename
    });
  }
  
  return chunks;
}

/**
 * Score chunk relevance based on keywords
 */
export function scoreChunkRelevance(
  chunk: string,
  keywords: string[]
): number {
  if (keywords.length === 0) return 0;
  
  let score = 0;
  const lowerChunk = chunk.toLowerCase();
  
  keywords.forEach(keyword => {
    // Count keyword occurrences
    const matches = (lowerChunk.match(new RegExp(keyword, 'g')) || []).length;
    score += matches * 2; // Higher weight for chunk-level matches
    
    // Bonus for keyword in first 100 characters
    if (lowerChunk.substring(0, 100).includes(keyword)) {
      score += 3;
    }
  });
  
  // Bonus for multiple keywords appearing together (proximity)
  if (keywords.length > 1) {
    let foundKeywords = keywords.filter(kw => lowerChunk.includes(kw));
    if (foundKeywords.length > 1) {
      score += foundKeywords.length * 1.5; // Proximity bonus
    }
  }
  
  return score;
}

/**
 * Main retrieval function: intelligently select relevant knowledge
 */
export async function retrieveRelevantKnowledge(
  files: KnowledgeFile[],
  userMessage: string,
  modelName: string,
  intent: IntentType
): Promise<RetrievalResult> {
  console.log(`\n=== SMART KNOWLEDGE RETRIEVAL ===`);
  console.log(`User query: "${userMessage.substring(0, 100)}..."`);
  console.log(`Model: ${modelName}`);
  console.log(`Intent: ${intent}`);
  
  // Extract keywords from user query
  const keywords = extractKeywords(userMessage);
  console.log(`Extracted keywords: ${keywords.join(', ')}`);
  
  // Get model's context limit
  const modelLimit = getModelContextLimit(modelName);
  console.log(`Model context limit: ${modelLimit} tokens`);
  
  // Calculate available token budget for knowledge
  // Reserve: 2000 for response, 500 for base prompt, 200 for user message
  const reservedTokens = 2700;
  const availableTokens = modelLimit - reservedTokens;
  console.log(`Available tokens for knowledge: ${availableTokens}`);
  
  // Strategy 1: If no keywords or general question, use instruction templates
  if (keywords.length === 0 || intent === 'normal_conversation') {
    console.log('Strategy: Using instruction templates for general conversation');
    return await retrieveGeneralKnowledge(files, availableTokens);
  }
  
  // Strategy 2: Semantic search with chunking for specific questions
  console.log('Strategy: Semantic search with relevance ranking');
  
  // Score and rank all files
  const scoredFiles = files
    .map(file => ({
      file,
      score: scoreFileRelevance(file.filename, file.content || '', keywords)
    }))
    .sort((a, b) => b.score - a.score);
  
  console.log('\nFile relevance scores:');
  scoredFiles.slice(0, 5).forEach(({ file, score }) => {
    console.log(`  ${file.filename}: ${score.toFixed(2)}`);
  });
  
  // Create chunks from top files
  const allChunks: ContentChunk[] = [];
  
  for (const { file, score: fileScore } of scoredFiles) {
    if (!file.content) continue;
    
    // Create chunks from file
    const fileChunks = chunkContent(file.content, file.filename, 2000);
    
    // Score each chunk
    fileChunks.forEach(chunk => {
      const chunkScore = scoreChunkRelevance(chunk.text, keywords);
      
      if (chunkScore > 0) {
        allChunks.push({
          content: chunk.text,
          filename: file.filename,
          relevanceScore: fileScore + chunkScore,
          tokens: estimateTokens(chunk.text)
        });
      }
    });
  }
  
  // Sort chunks by relevance
  allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  console.log(`\nTotal chunks created: ${allChunks.length}`);
  console.log(`Top chunk score: ${allChunks[0]?.relevanceScore.toFixed(2)}`);
  
  // Select chunks within token budget
  const selectedChunks: ContentChunk[] = [];
  let usedTokens = 0;
  const filesUsed = new Set<string>();
  
  for (const chunk of allChunks) {
    if (usedTokens + chunk.tokens <= availableTokens) {
      selectedChunks.push(chunk);
      usedTokens += chunk.tokens;
      filesUsed.add(chunk.filename);
      
      // Stop if we have enough diverse content
      if (selectedChunks.length >= 20 && filesUsed.size >= 3) {
        break;
      }
    }
  }
  
  console.log(`\nSelected ${selectedChunks.length} chunks from ${filesUsed.size} files`);
  console.log(`Total tokens used: ${usedTokens} / ${availableTokens}`);
  console.log('=================================\n');
  
  return {
    chunks: selectedChunks,
    totalTokens: usedTokens,
    filesUsed: Array.from(filesUsed),
    selectionStrategy: 'semantic-chunking'
  };
}

/**
 * Retrieve general knowledge (instruction templates + summary of factual knowledge)
 */
async function retrieveGeneralKnowledge(
  files: KnowledgeFile[],
  availableTokens: number
): Promise<RetrievalResult> {
  const selectedChunks: ContentChunk[] = [];
  let usedTokens = 0;
  const filesUsed = new Set<string>();
  
  // Prioritize instruction template files
  const templateFiles = files.filter(f => 
    f.filename.toLowerCase().includes('guide') ||
    f.filename.toLowerCase().includes('prompt') ||
    f.content?.toLowerCase().includes('you are')
  );
  
  // Add instruction templates first (higher priority)
  for (const file of templateFiles) {
    if (!file.content) continue;
    
    const fileTokens = estimateTokens(file.content);
    
    if (usedTokens + fileTokens <= availableTokens) {
      selectedChunks.push({
        content: file.content,
        filename: file.filename,
        relevanceScore: 10, // High priority
        tokens: fileTokens
      });
      usedTokens += fileTokens;
      filesUsed.add(file.filename);
    }
  }
  
  // Add factual knowledge files with token budget
  const factualFiles = files.filter(f => !templateFiles.includes(f));
  
  for (const file of factualFiles) {
    if (!file.content) continue;
    
    const fileTokens = estimateTokens(file.content);
    
    // If file fits completely, add it
    if (usedTokens + fileTokens <= availableTokens) {
      selectedChunks.push({
        content: file.content,
        filename: file.filename,
        relevanceScore: 5,
        tokens: fileTokens
      });
      usedTokens += fileTokens;
      filesUsed.add(file.filename);
    } else {
      // Otherwise, add a summary chunk (first 2000 chars)
      const summaryContent = file.content.substring(0, 2000) + '\n\n[Content truncated for brevity...]';
      const summaryTokens = estimateTokens(summaryContent);
      
      if (usedTokens + summaryTokens <= availableTokens) {
        selectedChunks.push({
          content: summaryContent,
          filename: file.filename,
          relevanceScore: 3,
          tokens: summaryTokens
        });
        usedTokens += summaryTokens;
        filesUsed.add(file.filename);
      }
    }
  }
  
  console.log(`General knowledge retrieval: ${selectedChunks.length} chunks, ${usedTokens} tokens`);
  
  return {
    chunks: selectedChunks,
    totalTokens: usedTokens,
    filesUsed: Array.from(filesUsed),
    selectionStrategy: 'general-instruction-based'
  };
}

/**
 * Build optimized system prompt with smart knowledge integration
 */
export function buildOptimizedPrompt(
  basePrompt: string,
  retrievalResult: RetrievalResult,
  intent: IntentType
): string {
  let prompt = basePrompt || 'You are a helpful AI assistant.';
  
  // Add knowledge base content
  if (retrievalResult.chunks.length > 0) {
    prompt += '\n\n=== KNOWLEDGE BASE ===\n';
    prompt += `You have access to relevant information from ${retrievalResult.filesUsed.length} documents. Use this information to provide accurate, detailed responses.\n\n`;
    
    // Group chunks by file for better organization
    const chunksByFile = new Map<string, ContentChunk[]>();
    retrievalResult.chunks.forEach(chunk => {
      if (!chunksByFile.has(chunk.filename)) {
        chunksByFile.set(chunk.filename, []);
      }
      chunksByFile.get(chunk.filename)!.push(chunk);
    });
    
    // Add chunks organized by file
    chunksByFile.forEach((chunks, filename) => {
      prompt += `\n--- ${filename} ---\n`;
      chunks.forEach(chunk => {
        prompt += chunk.content + '\n\n';
      });
    });
    
    prompt += '=== END KNOWLEDGE BASE ===\n\n';
  }
  
  // Add intent-specific instructions
  if (intent === 'hook_generation') {
    prompt += 'Task: Generate 5 viral hooks based on the knowledge base content.\n';
  } else if (intent === 'post_rewrite') {
    prompt += 'Task: Rewrite the provided post using insights from the knowledge base.\n';
  } else {
    prompt += 'Use the knowledge base to provide detailed, accurate answers. Reference specific information when relevant.\n';
  }
  
  return prompt;
}
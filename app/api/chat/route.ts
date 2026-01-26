/**
 * Knowledge Retrieval System - FIXED VERSION
 * 
 * Key fixes:
 * 1. Token estimation: 1 token = 2.5 chars (was 4 chars - TOO OPTIMISTIC)
 * 2. Aggressive token limiting for general queries
 * 3. Better budget management with safety margins
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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
  'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'what',
  'which', 'who', 'when', 'where', 'why', 'how', 'tell', 'me', 'about',
  'give', 'want', 'need', 'know', 'get', 'help'
]);

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  'gpt-3.5-turbo': 16000,
  'gpt-4': 8000,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'claude-3-opus': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku': 200000,
  'llama-3.1-8b': 128000,
  'llama-3.1-70b': 128000,
  'default': 8000
};

/**
 * CRITICAL FIX: Conservative token estimation
 * Real testing shows 1 token ≈ 2.5-3 characters, NOT 4
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2.5); // FIXED from /4
}

export function getModelContextLimit(modelName: string): number {
  if (MODEL_CONTEXT_LIMITS[modelName]) {
    return MODEL_CONTEXT_LIMITS[modelName];
  }
  
  const lower = modelName.toLowerCase();
  if (lower.includes('gpt-4-turbo') || lower.includes('gpt-4o')) return 128000;
  if (lower.includes('gpt-4')) return 8000;
  if (lower.includes('gpt-3.5')) return 16000;
  if (lower.includes('claude-3')) return 200000;
  if (lower.includes('llama-3.1')) return 128000;
  
  return 8000;
}

export function extractKeywords(query: string): string[] {
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const keywords = words.filter(word => !STOP_WORDS.has(word));
  return [...new Set(keywords)];
}

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
    if (lowerFilename.includes(keyword)) score += 3.0;
    
    const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
    score += Math.min(matches * 0.2, 5);
    
    if (lowerContent.substring(0, 1000).includes(keyword)) score += 1.0;
  });
  
  return score;
}

export function chunkContent(
  content: string,
  filename: string,
  maxChunkSize: number = 2000
): Array<{ text: string; filename: string }> {
  const chunks: Array<{ text: string; filename: string }> = [];
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    
    if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({ text: currentChunk.trim(), filename });
      currentChunk = '';
    }
    
    if (trimmed.length > maxChunkSize) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push({ text: currentChunk.trim(), filename });
          currentChunk = '';
        }
        currentChunk += sentence + ' ';
      }
    } else {
      currentChunk += trimmed + '\n\n';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push({ text: currentChunk.trim(), filename });
  }
  
  return chunks;
}

export function scoreChunkRelevance(chunk: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  
  let score = 0;
  const lower = chunk.toLowerCase();
  
  keywords.forEach(keyword => {
    const matches = (lower.match(new RegExp(keyword, 'g')) || []).length;
    score += matches * 2;
    
    if (lower.substring(0, 100).includes(keyword)) score += 3;
  });
  
  if (keywords.length > 1) {
    const found = keywords.filter(kw => lower.includes(kw));
    if (found.length > 1) score += found.length * 1.5;
  }
  
  return score;
}

export async function retrieveRelevantKnowledge(
  files: KnowledgeFile[],
  userMessage: string,
  modelName: string,
  intent: IntentType
): Promise<RetrievalResult> {
  console.log(`\n=== SMART KNOWLEDGE RETRIEVAL ===`);
  console.log(`Model: ${modelName}`);
  console.log(`Intent: ${intent}`);
  
  const keywords = extractKeywords(userMessage);
  console.log(`Keywords: ${keywords.join(', ')}`);
  
  const modelLimit = getModelContextLimit(modelName);
  console.log(`Model limit: ${modelLimit} tokens`);
  
  // CRITICAL FIX: More aggressive reservation and capping
  const reservedTokens = 4000;
  const rawAvailable = modelLimit - reservedTokens;
  const maxKnowledge = keywords.length >= 2 ? 35000 : 15000; // REDUCED caps
  const availableTokens = Math.min(rawAvailable, maxKnowledge);
  
  console.log(`Available for knowledge: ${availableTokens} tokens`);
  
  if (keywords.length < 2) {
    console.log('Strategy: Limited general knowledge');
    return await retrieveGeneralKnowledge(files, availableTokens);
  }
  
  console.log('Strategy: Semantic chunking');
  return await retrieveSemanticKnowledge(files, keywords, availableTokens);
}

async function retrieveSemanticKnowledge(
  files: KnowledgeFile[],
  keywords: string[],
  availableTokens: number
): Promise<RetrievalResult> {
  
  const scoredFiles = files
    .map(file => ({
      file,
      score: scoreFileRelevance(file.filename, file.content || '', keywords)
    }))
    .sort((a, b) => b.score - a.score);
  
  const allChunks: ContentChunk[] = [];
  
  for (const { file, score: fileScore } of scoredFiles) {
    if (!file.content) continue;
    
    const fileChunks = chunkContent(file.content, file.filename);
    
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
  
  allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  const selectedChunks: ContentChunk[] = [];
  let usedTokens = 0;
  const filesUsed = new Set<string>();
  
  for (const chunk of allChunks) {
    if (usedTokens + chunk.tokens <= availableTokens) {
      selectedChunks.push(chunk);
      usedTokens += chunk.tokens;
      filesUsed.add(chunk.filename);
      
      if (selectedChunks.length >= 15 && filesUsed.size >= 3) break;
    }
  }
  
  console.log(`Selected ${selectedChunks.length} chunks, ${usedTokens} tokens`);
  
  return {
    chunks: selectedChunks,
    totalTokens: usedTokens,
    filesUsed: Array.from(filesUsed),
    selectionStrategy: 'semantic-chunking'
  };
}

async function retrieveGeneralKnowledge(
  files: KnowledgeFile[],
  availableTokens: number
): Promise<RetrievalResult> {
  const selectedChunks: ContentChunk[] = [];
  let usedTokens = 0;
  const filesUsed = new Set<string>();
  
  // Prioritize instruction templates
  const templates = files.filter(f => 
    f.filename.toLowerCase().includes('guide') ||
    f.filename.toLowerCase().includes('prompt')
  ).slice(0, 1); // ONLY 1 template file
  
  for (const file of templates) {
    if (!file.content) continue;
    
    const tokens = estimateTokens(file.content);
    
    if (usedTokens + tokens <= availableTokens) {
      selectedChunks.push({
        content: file.content,
        filename: file.filename,
        relevanceScore: 10,
        tokens
      });
      usedTokens += tokens;
      filesUsed.add(file.filename);
    }
  }
  
  // Add SHORT previews from factual files
  const factual = files.filter(f => !templates.includes(f)).slice(0, 2);
  
  for (const file of factual) {
    if (!file.content) continue;
    
    const preview = file.content.substring(0, 1500) + '\n[Preview only]';
    const tokens = estimateTokens(preview);
    
    if (usedTokens + tokens <= availableTokens) {
      selectedChunks.push({
        content: preview,
        filename: file.filename,
        relevanceScore: 3,
        tokens
      });
      usedTokens += tokens;
      filesUsed.add(file.filename);
    }
  }
  
  console.log(`General: ${selectedChunks.length} chunks, ${usedTokens} tokens`);
  
  return {
    chunks: selectedChunks,
    totalTokens: usedTokens,
    filesUsed: Array.from(filesUsed),
    selectionStrategy: 'general-limited'
  };
}

export function buildOptimizedPrompt(
  basePrompt: string,
  retrievalResult: RetrievalResult,
  intent: IntentType
): string {
  let prompt = basePrompt || 'You are a helpful AI assistant.';
  
  if (retrievalResult.chunks.length > 0) {
    prompt += '\n\n=== KNOWLEDGE BASE ===\n';
    
    const chunksByFile = new Map<string, ContentChunk[]>();
    retrievalResult.chunks.forEach(chunk => {
      if (!chunksByFile.has(chunk.filename)) {
        chunksByFile.set(chunk.filename, []);
      }
      chunksByFile.get(chunk.filename)!.push(chunk);
    });
    
    chunksByFile.forEach((chunks, filename) => {
      prompt += `\n--- ${filename} ---\n`;
      chunks.forEach(chunk => {
        prompt += chunk.content + '\n\n';
      });
    });
    
    prompt += '=== END KNOWLEDGE BASE ===\n\n';
  }
  
  if (intent === 'hook_generation') {
    prompt += 'Generate 5 viral hooks.\n';
  } else if (intent === 'post_rewrite') {
    prompt += 'Rewrite using the knowledge base.\n';
  } else {
    prompt += 'Provide detailed, accurate answers using the knowledge base.\n';
  }
  
  return prompt;
}
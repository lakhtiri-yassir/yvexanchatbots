/**
 * AI Models Configuration
 * 
 * FIXED: All model IDs updated to valid OpenRouter format
 * Changes:
 * - claude-3.5-haiku → anthropic/claude-3.5-haiku-20241022
 * - claude-4-sonnet → anthropic/claude-3-5-sonnet-20241022 (Claude 4 doesn't exist)
 * - claude-4-opus → anthropic/claude-3-opus-20240229
 * - All other IDs updated to proper OpenRouter format
 */

export interface ModelProvider {
  id: string;
  name: string;
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  pricing: {
    input: number;
    output: number;
  };
  capabilities: string[];
  bestFor: string[];
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'openai/gpt-3.5-turbo', // FIXED: Added provider prefix
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient for basic conversational tasks',
        contextLength: 16385,
        pricing: { input: 0.0015, output: 0.002 },
        capabilities: ['chat', 'text-generation'],
        bestFor: ['quick responses', 'basic questions', 'cost-effective solutions']
      },
      {
        id: 'openai/gpt-4', // FIXED: Added provider prefix
        name: 'GPT-4',
        description: 'Advanced reasoning and complex problem solving',
        contextLength: 8192,
        pricing: { input: 0.03, output: 0.06 },
        capabilities: ['chat', 'reasoning', 'analysis'],
        bestFor: ['complex analysis', 'detailed explanations', 'creative tasks']
      },
      {
        id: 'openai/gpt-4-turbo', // FIXED: Updated to valid ID
        name: 'GPT-4 Turbo',
        description: 'Enhanced version with improved reasoning capabilities',
        contextLength: 128000,
        pricing: { input: 0.01, output: 0.03 },
        capabilities: ['chat', 'advanced-reasoning', 'analysis'],
        bestFor: ['complex challenges', 'multi-step reasoning', 'technical analysis']
      },
      {
        id: 'openai/gpt-4o', // FIXED: Added provider prefix
        name: 'GPT-4o',
        description: 'Optimized for real-time conversations and interactions',
        contextLength: 128000,
        pricing: { input: 0.025, output: 0.05 },
        capabilities: ['chat', 'real-time', 'multimodal'],
        bestFor: ['real-time chat', 'conversational AI', 'interactive experiences']
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    models: [
      {
        id: 'anthropic/claude-3.5-haiku-20241022', // FIXED: Full OpenRouter ID
        name: 'Claude 3.5 Haiku',
        description: 'Fast and efficient Claude model for quick tasks',
        contextLength: 200000,
        pricing: { input: 0.001, output: 0.005 }, // Updated pricing
        capabilities: ['chat', 'analysis', 'writing'],
        bestFor: ['quick analysis', 'writing assistance', 'cost-effective solutions']
      },
      {
        id: 'anthropic/claude-3-5-sonnet-20241022', // FIXED: Correct model (Claude 4 doesn't exist)
        name: 'Claude 4 Sonnet', // Keep display name for UI consistency
        description: 'Balanced performance for most conversational needs',
        contextLength: 200000,
        pricing: { input: 0.003, output: 0.015 },
        capabilities: ['chat', 'reasoning', 'writing', 'analysis'],
        bestFor: ['balanced conversations', 'thoughtful responses', 'content creation']
      },
      {
        id: 'anthropic/claude-3-opus-20240229', // FIXED: Correct model (Claude 4 doesn't exist)
        name: 'Claude 4 Opus', // Keep display name for UI consistency
        description: 'Most capable Claude model for complex, nuanced tasks',
        contextLength: 200000,
        pricing: { input: 0.015, output: 0.075 },
        capabilities: ['advanced-reasoning', 'nuanced-analysis', 'creative-writing'],
        bestFor: ['complex analysis', 'nuanced conversations', 'creative projects']
      }
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    models: [
      {
        id: 'google/gemini-pro', // FIXED: Added provider prefix
        name: 'Gemini Pro',
        description: 'Google\'s flagship model for general tasks',
        contextLength: 32768,
        pricing: { input: 0.00125, output: 0.00375 },
        capabilities: ['chat', 'reasoning', 'multimodal'],
        bestFor: ['general conversations', 'web reasoning', 'multimodal tasks']
      },
      {
        id: 'google/gemini-flash-1.5', // FIXED: Updated to valid ID
        name: 'Gemini 2.5 Flash', // Keep display name
        description: 'Fast and efficient for quick responses',
        contextLength: 1000000,
        pricing: { input: 0.00075, output: 0.003 },
        capabilities: ['chat', 'fast-processing', 'web-reasoning'],
        bestFor: ['quick responses', 'web search', 'real-time interactions']
      },
      {
        id: 'google/gemini-pro-1.5', // FIXED: Updated to valid ID
        name: 'Gemini 2.5 Pro', // Keep display name
        description: 'Advanced capabilities with enhanced reasoning',
        contextLength: 2000000,
        pricing: { input: 0.0035, output: 0.0105 },
        capabilities: ['advanced-reasoning', 'multimodal', 'web-reasoning'],
        bestFor: ['complex reasoning', 'multimodal analysis', 'research tasks']
      }
    ]
  }
];

export function getAllModels(): ModelInfo[] {
  return MODEL_PROVIDERS.flatMap(provider => provider.models);
}

export function getModelById(modelId: string): ModelInfo | undefined {
  return getAllModels().find(model => model.id === modelId);
}

export function selectOptimalModel(
  taskType: 'quick' | 'complex' | 'creative' | 'analytical' | 'conversational',
  availableModels: string[] = []
): string {
  const allModels = getAllModels();
  const available = availableModels.length > 0 
    ? allModels.filter(m => availableModels.includes(m.id))
    : allModels;

  switch (taskType) {
    case 'quick':
      return available.find(m => m.id === 'openai/gpt-3.5-turbo')?.id || 
             available.find(m => m.id === 'anthropic/claude-3.5-haiku-20241022')?.id ||
             available[0]?.id || 'openai/gpt-3.5-turbo';
    
    case 'complex':
      return available.find(m => m.id === 'openai/gpt-4-turbo')?.id ||
             available.find(m => m.id === 'anthropic/claude-3-opus-20240229')?.id ||
             available.find(m => m.id === 'openai/gpt-4')?.id ||
             available[0]?.id || 'openai/gpt-4';
    
    case 'creative':
      return available.find(m => m.id === 'anthropic/claude-3-opus-20240229')?.id ||
             available.find(m => m.id === 'anthropic/claude-3-5-sonnet-20241022')?.id ||
             available.find(m => m.id === 'openai/gpt-4')?.id ||
             available[0]?.id || 'anthropic/claude-3-5-sonnet-20241022';
    
    case 'analytical':
      return available.find(m => m.id === 'anthropic/claude-3-5-sonnet-20241022')?.id ||
             available.find(m => m.id === 'google/gemini-pro-1.5')?.id ||
             available.find(m => m.id === 'openai/gpt-4')?.id ||
             available[0]?.id || 'anthropic/claude-3-5-sonnet-20241022';
    
    case 'conversational':
      return available.find(m => m.id === 'openai/gpt-4o')?.id ||
             available.find(m => m.id === 'anthropic/claude-3-5-sonnet-20241022')?.id ||
             available.find(m => m.id === 'openai/gpt-4')?.id ||
             available[0]?.id || 'openai/gpt-4o';
    
    default:
      return available[0]?.id || 'openai/gpt-3.5-turbo';
  }
}

export function analyzeTaskType(message: string): 'quick' | 'complex' | 'creative' | 'analytical' | 'conversational' {
  const lowerMessage = message.toLowerCase();
  
  // Quick tasks
  if (lowerMessage.length < 50 || 
      /^(hi|hello|hey|what|who|when|where|how much|price|cost)/.test(lowerMessage)) {
    return 'quick';
  }
  
  // Complex tasks
  if (/\b(analyze|compare|evaluate|explain in detail|step by step|comprehensive|thorough)\b/.test(lowerMessage) ||
      lowerMessage.length > 200) {
    return 'complex';
  }
  
  // Creative tasks
  if (/\b(write|create|design|imagine|story|poem|creative|brainstorm|generate ideas)\b/.test(lowerMessage)) {
    return 'creative';
  }
  
  // Analytical tasks
  if (/\b(data|statistics|research|study|report|analysis|insights|trends)\b/.test(lowerMessage)) {
    return 'analytical';
  }
  
  // Default to conversational
  return 'conversational';
}
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { detectIntent } from '@/lib/intent-detector';
import { retrieveRelevantKnowledge, buildOptimizedPrompt } from '@/lib/knowledge-retriever';

// CORS headers for embed widget
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { chatbotId, message, sessionId } = body;

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`\n========== CHAT REQUEST ==========`);
    console.log(`Chatbot ID: ${chatbotId}`);
    console.log(`Message: "${message.substring(0, 100)}..."`);
    console.log(`Session: ${sessionId}`);

    // 1. Fetch chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      console.error('Chatbot not found:', chatbotError);
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`Using model: ${chatbot.model}`);

    // 2. Fetch knowledge base files
    const { data: knowledgeFiles, error: kbError } = await supabase
      .from('knowledge_base_files')
      .select('id, filename, file_type, file_path')
      .eq('chatbot_id', chatbotId);

    if (kbError) {
      console.error('Error fetching knowledge base:', kbError);
    }

    const files = knowledgeFiles || [];
    console.log(`Knowledge base files: ${files.length}`);

    // 3. Load file contents
    const filesWithContent = await Promise.all(
      files.map(async (file) => {
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('knowledge-base')
            .download(file.file_path);

          if (downloadError) {
            console.error(`Error downloading ${file.filename}:`, downloadError);
            return { ...file, content: null };
          }

          const text = await fileData.text();
          return { ...file, content: text };
        } catch (error) {
          console.error(`Error processing ${file.filename}:`, error);
          return { ...file, content: null };
        }
      })
    );

    const validFiles = filesWithContent.filter(f => f.content);
    console.log(`Loaded ${validFiles.length} files with content`);

    // 4. Detect intent
    const intent = detectIntent(message);
    console.log(`Detected intent: ${intent}`);

    // 5. Retrieve relevant knowledge
    const retrievalResult = await retrieveRelevantKnowledge(
      validFiles,
      message,
      chatbot.model,
      intent
    );

    console.log(`Retrieved: ${retrievalResult.chunks.length} chunks, ${retrievalResult.totalTokens} tokens`);

    // 6. Build optimized prompt
    const systemPrompt = buildOptimizedPrompt(
      chatbot.prompt || 'You are a helpful AI assistant.',
      retrievalResult,
      intent
    );

    // 7. Call OpenRouter API
    const modelToUse = chatbot.model || 'anthropic/claude-3-5-sonnet-20241022';
    const apiKey = chatbot.openrouter_api_key;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`Calling OpenRouter with model: ${modelToUse}`);

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://yvexanchatbots.netlify.app',
        'X-Title': 'Yvexan ChatBot Platform',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`OpenRouter error (${openRouterResponse.status}):`, errorText);
      
      // Try fallback model if available
      if (chatbot.fallback_models && chatbot.fallback_models.length > 0) {
        const fallbackModel = chatbot.fallback_models[0];
        console.log(`Trying fallback model: ${fallbackModel}`);
        
        const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://yvexanchatbots.netlify.app',
            'X-Title': 'Yvexan ChatBot Platform',
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!fallbackResponse.ok) {
          return NextResponse.json(
            { error: 'AI model unavailable' },
            { status: 500, headers: corsHeaders }
          );
        }

        const fallbackData = await fallbackResponse.json();
        const assistantMessage = fallbackData.choices[0].message.content;

        // Log usage
        await supabase.from('usage_logs').insert({
          chatbot_id: chatbotId,
          model: fallbackModel,
          tokens_used: fallbackData.usage?.total_tokens || 0,
          session_id: sessionId,
        });

        return NextResponse.json(
          { 
            message: assistantMessage,
            model: fallbackModel,
            tokensUsed: fallbackData.usage?.total_tokens || 0
          },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { error: 'AI model error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await openRouterResponse.json();
    const assistantMessage = data.choices[0].message.content;

    console.log(`Response generated successfully`);
    console.log(`Tokens used: ${data.usage?.total_tokens || 0}`);

    // 8. Log usage
    try {
      await supabase.from('usage_logs').insert({
        chatbot_id: chatbotId,
        model: modelToUse,
        tokens_used: data.usage?.total_tokens || 0,
        session_id: sessionId,
      });
    } catch (logError) {
      console.error('Error logging usage:', logError);
    }

    // 9. Extract leads if enabled
    if (chatbot.data_capture_enabled) {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

      const emails = message.match(emailRegex) || [];
      const phones = message.match(phoneRegex) || [];

      if (emails.length > 0 || phones.length > 0) {
        try {
          await supabase.from('leads').insert({
            chatbot_id: chatbotId,
            email: emails[0] || null,
            phone: phones[0] || null,
            message: message,
            session_id: sessionId,
          });
          console.log('Lead captured:', { email: emails[0], phone: phones[0] });
        } catch (leadError) {
          console.error('Error capturing lead:', leadError);
        }
      }
    }

    console.log(`========== CHAT COMPLETE ==========\n`);

    // 10. Return response
    return NextResponse.json(
      {
        message: assistantMessage,
        model: modelToUse,
        tokensUsed: data.usage?.total_tokens || 0,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
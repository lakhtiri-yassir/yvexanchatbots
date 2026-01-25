import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAdvancedRouting, ChatMessage } from '@/lib/openrouter-advanced';
import { generateSpeech } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, message, sessionId } = await request.json();

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Fetch knowledge base files
    const { data: knowledgeFiles } = await supabase
      .from('knowledge_base_files')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .limit(5); // Limit to 5 most recent files

    let knowledgeContext = '';
    
    // Download and read file contents
    if (knowledgeFiles && knowledgeFiles.length > 0) {
      for (const file of knowledgeFiles) {
        try {
          const { data: fileData } = await supabase.storage
            .from('knowledge-base')
            .download(file.file_path);

          if (fileData) {
            const text = await fileData.text();
            knowledgeContext += `\n\n--- Content from ${file.filename} ---\n${text}\n`;
          }
        } catch (err) {
          console.error(`Failed to read ${file.filename}:`, err);
        }
      }
    }

    // Prepare messages for OpenRouter
    let systemPrompt = chatbot.prompt || 'You are a helpful AI assistant.';
    
    // Add knowledge base context to prompt
    if (knowledgeContext) {
      systemPrompt += '\n\nYou have access to the following knowledge base. Use this information to answer questions accurately:\n' + knowledgeContext;
    }

    const messages: ChatMessage[] = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Add lead capture prompt if enabled
    if (chatbot.data_capture_enabled) {
      messages[0].content += '\n\nIf appropriate during the conversation, naturally ask for the user\'s full name, email, and phone number. Don\'t be pushy - only ask when it feels natural based on the conversation context.';
    }

    // Get response from OpenRouter
    const chatResponse = await chatWithAdvancedRouting(
      chatbot.openrouter_api_key,
      messages,
      {
        preferredModel: chatbot.model,
        autoModelSelection: chatbot.auto_model_selection,
        fallbackModels: chatbot.fallback_models || ['gpt-3.5-turbo', 'claude-3.5-haiku'],
        temperature: 0.7,
        maxTokens: 2000
      }
    );

    const aiMessage = chatResponse.message;
    const tokensUsed = chatResponse.tokensUsed;
    const modelUsed = chatResponse.model;
    const estimatedCost = chatResponse.cost;

    // Log usage
    const { error: usageError } = await supabase
      .from('usage_logs')
      .insert({
        chatbot_id: chatbotId,
        user_id: chatbot.user_id,
        tokens_used: tokensUsed,
        model_used: modelUsed,
        request_type: 'chat',
        cost_estimate: estimatedCost,
      });

    if (usageError) {
      console.error('Error logging usage:', usageError);
    }

    // Check for lead information extraction
    let leadData = null;
    if (chatbot.data_capture_enabled) {
      const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = message.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
      
      if (emailMatch || phoneMatch) {
        leadData = {
          email: emailMatch ? emailMatch[0] : null,
          phone: phoneMatch ? phoneMatch[0] : null,
          full_name: null,
          conversation_context: { message, response: aiMessage },
        };

        await supabase
          .from('leads')
          .insert({
            chatbot_id: chatbotId,
            user_id: chatbot.user_id,
            ...leadData,
          });
      }
    }

    let audioData = null;
    if (chatbot.voice_enabled && chatbot.elevenlabs_api_key && chatbot.voice_id) {
      try {
        const audioBuffer = await generateSpeech(
          chatbot.elevenlabs_api_key,
          chatbot.voice_id,
          aiMessage,
          chatbot.voice_settings
        );
        
        audioData = Buffer.from(audioBuffer).toString('base64');

        await supabase
          .from('usage_logs')
          .insert({
            chatbot_id: chatbotId,
            user_id: chatbot.user_id,
            tokens_used: aiMessage.length,
            model_used: 'elevenlabs-tts',
            request_type: 'voice',
            cost_estimate: aiMessage.length * 0.00001,
          });
      } catch (voiceError) {
        console.error('Voice generation error:', voiceError);
      }
    }

    return NextResponse.json({
      message: aiMessage,
      audio: audioData,
      leadCaptured: leadData !== null,
      tokensUsed,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
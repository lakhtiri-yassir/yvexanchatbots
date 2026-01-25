import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAdvancedRouting, ChatMessage } from '@/lib/openrouter-advanced';
import { generateSpeech } from '@/lib/elevenlabs';
import { detectIntent, extractPostContent } from '@/lib/intent-detector';
import { 
  categorizeKnowledgeFile, 
  extractInstructionTemplate, 
  buildContextualPrompt,
  cleanResponse,
  InstructionTemplate
} from '@/lib/knowledge-processor';

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
      .limit(10); // Increased limit for more context

    // INTELLIGENT KNOWLEDGE PROCESSING
    const instructionTemplates: InstructionTemplate[] = [];
    const factualKnowledge: string[] = [];

    // Process knowledge base files
    if (knowledgeFiles && knowledgeFiles.length > 0) {
      for (const file of knowledgeFiles) {
        try {
          const { data: fileData } = await supabase.storage
            .from('knowledge-base')
            .download(file.file_path);

          if (fileData) {
            const text = await fileData.text();
            
            // Categorize the file
            const category = categorizeKnowledgeFile(file.filename, text);
            
            console.log(`File: ${file.filename}, Category: ${category}`);
            
            if (category === 'instruction_template') {
              // Extract structured instruction template
              const template = extractInstructionTemplate(text);
              instructionTemplates.push(template);
              console.log('Extracted instruction template:', template.systemRules.substring(0, 100));
            } else if (category === 'factual_knowledge') {
              // Store as factual knowledge
              factualKnowledge.push(`--- Content from ${file.filename} ---\n${text}`);
            }
          }
        } catch (err) {
          console.error(`Failed to read ${file.filename}:`, err);
        }
      }
    }

    // INTENT DETECTION
    const intent = detectIntent(message);
    const postContent = extractPostContent(message);
    
    console.log('Detected intent:', intent);
    console.log('Post content extracted:', postContent ? 'Yes' : 'No');

    // BUILD CONTEXTUAL SYSTEM PROMPT
    const systemPrompt = buildContextualPrompt(
      intent,
      instructionTemplates,
      factualKnowledge,
      postContent || message,
      chatbot.prompt || 'You are a helpful AI assistant.'
    );

    console.log('System prompt length:', systemPrompt.length);
    console.log('System prompt preview:', systemPrompt.substring(0, 200));

    // Prepare user message
    let userMessage = message;
    
    // For framework intents with extracted post, use just the post
    if ((intent === 'hook_generation' || intent === 'post_rewrite') && postContent) {
      userMessage = postContent;
    }

    // Prepare messages for OpenRouter
    const messages: ChatMessage[] = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Add lead capture prompt ONLY for normal conversation
    if (chatbot.data_capture_enabled && intent === 'normal_conversation') {
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

    // Clean the AI response
    let aiMessage = cleanResponse(chatResponse.message, intent);
    
    const tokensUsed = chatResponse.tokensUsed;
    const modelUsed = chatResponse.model;
    const estimatedCost = chatResponse.cost;

    console.log('AI response length:', aiMessage.length);
    console.log('AI response preview:', aiMessage.substring(0, 200));

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

    // Check for lead information extraction (only for normal conversation)
    let leadData = null;
    if (chatbot.data_capture_enabled && intent === 'normal_conversation') {
      const emailMatch = message.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = message.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
      
      if (emailMatch || phoneMatch) {
        leadData = {
          email: emailMatch ? emailMatch[0] : null,
          phone: phoneMatch ? phoneMatch[0] : null,
          full_name: null, // Would need more sophisticated extraction
          conversation_context: { message, response: aiMessage },
        };

        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            chatbot_id: chatbotId,
            user_id: chatbot.user_id,
            email: leadData.email,
            phone: leadData.phone,
            full_name: leadData.full_name,
            conversation_context: leadData.conversation_context,
          });

        if (leadError) {
          console.error('Error saving lead:', leadError);
        }
      }
    }

    // Generate voice if enabled (only for normal conversation)
    let audioUrl = null;
    if (chatbot.voice_enabled && 
        chatbot.elevenlabs_api_key && 
        chatbot.voice_id &&
        intent === 'normal_conversation') {
      try {
        audioUrl = await generateSpeech(
          chatbot.elevenlabs_api_key,
          chatbot.voice_id,
          aiMessage,
          chatbot.voice_settings
        );
      } catch (error) {
        console.error('Voice generation error:', error);
      }
    }

    return NextResponse.json({
      message: aiMessage,
      audioUrl,
      leadCaptured: !!leadData,
      model: modelUsed,
      tokensUsed,
      intent, // Include intent in response for debugging
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
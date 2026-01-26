import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
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
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, message, sessionId } = await request.json();

    // Use admin client to bypass RLS for server-side operations
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available - missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get chatbot configuration using admin client
    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      console.error('Chatbot not found:', chatbotError);
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Fetch knowledge base files using admin client
    const { data: knowledgeFiles, error: knowledgeError } = await supabaseAdmin
      .from('knowledge_base_files')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .limit(10);

    if (knowledgeError) {
      console.error('Error fetching knowledge files:', knowledgeError);
    }

    // INTELLIGENT KNOWLEDGE PROCESSING
    const instructionTemplates: InstructionTemplate[] = [];
    const factualKnowledge: string[] = [];

    // Process knowledge base files
    if (knowledgeFiles && knowledgeFiles.length > 0) {
      console.log(`Found ${knowledgeFiles.length} knowledge base files to process`);
      
      for (const file of knowledgeFiles) {
        try {
          // Download file using admin client
          const { data: fileData, error: downloadError } = await supabaseAdmin.storage
            .from('knowledge-base')
            .download(file.file_path);

          if (downloadError) {
            console.error(`Failed to download ${file.filename}:`, downloadError);
            continue;
          }

          if (fileData) {
            let text = '';
            
            // Handle different file types
            if (file.file_type === 'pdf' || file.filename.toLowerCase().endsWith('.pdf')) {
              // Parse PDF
              try {
                console.log(`Parsing PDF: ${file.filename}`);
                const arrayBuffer = await fileData.arrayBuffer();
                const pdfData = await pdfParse(Buffer.from(arrayBuffer));
                text = pdfData.text;
                console.log(`PDF parsed successfully: ${file.filename}, ${text.length} characters extracted`);
              } catch (pdfError) {
                console.error(`Failed to parse PDF ${file.filename}:`, pdfError);
                continue; // Skip this file and move to next
              }
            } else {
              // Plain text file (TXT, or DOCX converted to text)
              text = await fileData.text();
              console.log(`Text file read: ${file.filename}, ${text.length} characters`);
            }
            
            // Categorize the file
            const category = categorizeKnowledgeFile(file.filename, text);
            
            console.log(`File: ${file.filename}, Category: ${category}`);
            
            if (category === 'instruction_template') {
              // Extract structured instruction template
              const template = extractInstructionTemplate(text);
              instructionTemplates.push(template);
              console.log('Extracted instruction template:', template.systemRules.substring(0, 100) + '...');
            } else if (category === 'factual_knowledge') {
              // Store as factual knowledge
              factualKnowledge.push(`--- Content from ${file.filename} ---\n${text}`);
              console.log('Added to factual knowledge base');
            }
          }
        } catch (err) {
          console.error(`Failed to process ${file.filename}:`, err);
        }
      }
    } else {
      console.log('No knowledge base files found for this chatbot');
    }

    // Log knowledge base processing results
    console.log('=== KNOWLEDGE BASE DEBUG ===');
    console.log(`Total files queried: ${knowledgeFiles?.length || 0}`);
    console.log(`Instruction templates found: ${instructionTemplates.length}`);
    console.log(`Factual knowledge items: ${factualKnowledge.length}`);
    
    if (instructionTemplates.length > 0) {
      console.log(`First template preview: ${instructionTemplates[0].systemRules.substring(0, 150)}...`);
    }
    
    if (factualKnowledge.length > 0) {
      console.log(`First knowledge preview: ${factualKnowledge[0].substring(0, 200)}...`);
    }
    console.log('============================');

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

    // Log usage using admin client
    const { error: usageError } = await supabaseAdmin
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
    } else {
      console.log('Usage logged successfully');
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
        };

        // Save lead using admin client
        const { error: leadError } = await supabaseAdmin
          .from('leads')
          .insert({
            chatbot_id: chatbotId,
            user_id: chatbot.user_id,
            email: leadData.email,
            phone: leadData.phone,
            conversation_context: { message, response: aiMessage },
          });

        if (leadError) {
          console.error('Error saving lead:', leadError);
        } else {
          console.log('Lead captured successfully');
        }
      }
    }

    // Return response
    return NextResponse.json({
      message: aiMessage,
      tokensUsed,
      model: modelUsed,
      cost: estimatedCost,
      leadCaptured: !!leadData,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred processing your message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
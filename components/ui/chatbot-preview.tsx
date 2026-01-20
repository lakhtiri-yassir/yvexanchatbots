"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChatbotPreviewProps {
  chatbotId: string;
  config: any;
  className?: string;
}

export function ChatbotPreview({
  chatbotId,
  config,
  className,
}: ChatbotPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Generate preview HTML with current config
      const previewHTML = generatePreviewHTML(chatbotId, config);
      const blob = new Blob([previewHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [chatbotId, config]);

  const generatePreviewHTML = (chatbotId: string, config: any) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${config.typography?.fontFamily || "Inter, sans-serif"};
      background: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .chatbot-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${config.color_scheme?.widgetBackground || "#ffffff"};
      border: 1px solid #e5e7eb;
    }
    
    .chatbot-header {
      background: ${config.color_scheme?.header || "#0f172a"};
      color: ${config.color_scheme?.headerText || "#ffffff"};
      padding: 16px;
      text-align: center;
      font-weight: 600;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    
    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .message {
      display: flex;
      gap: 8px;
      max-width: 80%;
    }
    
    .message.bot {
      align-self: flex-start;
    }
    
    .message.user {
      align-self: flex-end;
    }
    
    .message-bubble {
      padding: 12px 16px;
      border-radius: 12px;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .message.bot .message-bubble {
      background: ${config.color_scheme?.botMessage || "#f3f4f6"};
      color: ${config.color_scheme?.botMessageText || "#1f2937"};
    }
    
    .message.user .message-bubble {
      background: ${config.color_scheme?.userMessage || "#3b82f6"};
      color: ${config.color_scheme?.userMessageText || "#ffffff"};
    }
    
    .chatbot-input {
      background: ${config.color_scheme?.inputBackground || "#f9fafb"};
      border-top: 1px solid #e5e7eb;
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    
    .input-field {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 14px;
      background: ${config.color_scheme?.inputField || "#ffffff"};
      color: ${config.color_scheme?.inputText || "#1f2937"};
    }
    
    .input-field::placeholder {
      color: #9ca3af;
    }
    
    .send-button {
      background: ${config.color_scheme?.button || "#3b82f6"};
      color: ${config.color_scheme?.buttonText || "#ffffff"};
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    
    .send-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="chatbot-container">
    <div class="chatbot-header">
      ${config.owner_name || "Assistant"}
    </div>
    
    <div class="chatbot-messages">
      <div class="message bot">
        <div class="message-bubble">
          ${config.starting_phrase || "Hi there! How can I help you today?"}
        </div>
      </div>
      <div class="message user">
        <div class="message-bubble">
          Hello! I'd like to know more.
        </div>
      </div>
      <div class="message bot">
        <div class="message-bubble">
          I'm here to help! Feel free to ask me anything.
        </div>
      </div>
    </div>
    
    <div class="chatbot-input">
      <input type="text" class="input-field" placeholder="Type your message..." />
      <button class="send-button">Send</button>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 rounded-lg"
          title="Chatbot Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </CardContent>
    </Card>
  );
}

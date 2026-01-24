"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChatbotPreviewProps {
  chatbotId: string;
  config: any;
  className?: string;
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function ChatbotPreview({
  chatbotId,
  config,
  className,
  previewMode = "desktop",
}: ChatbotPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Generate preview HTML with current config
      const previewHTML = generatePreviewHTML(chatbotId, config, previewMode);
      const blob = new Blob([previewHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [chatbotId, config, previewMode]);

  const getShadowCSS = (shadow: string) => {
    switch (shadow) {
      case "light":
        return "0 1px 3px rgba(0, 0, 0, 0.1)";
      case "medium":
        return "0 4px 6px rgba(0, 0, 0, 0.1)";
      case "heavy":
        return "0 10px 15px rgba(0, 0, 0, 0.2)";
      default:
        return "none";
    }
  };

  const getAnimationKeyframes = (animation: string) => {
    const animations: { [key: string]: string } = {
      fade: `@keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }`,
      slideUp: `@keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }`,
      slideLeft: `@keyframes slideLeft {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }`,
      scale: `@keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }`,
      bounce: `@keyframes bounceIn {
        0% { transform: scale(0.9); opacity: 0; }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }`,
      none: "",
    };
    return animations[animation] || animations.fade;
  };

  const getButtonStyleCSS = (style: string) => {
    const styles: { [key: string]: string } = {
      modern: `
        background: ${config.color_scheme?.buttonPrimary || "#3b82f6"};
        color: ${config.color_scheme?.buttonText || "#ffffff"};
        border: none;
        border-radius: 8px;
        padding: ${config.input_config?.padding || "12px 16px"};
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      `,
      classic: `
        background: ${config.color_scheme?.buttonPrimary || "#3b82f6"};
        color: ${config.color_scheme?.buttonText || "#ffffff"};
        border: 1px solid ${config.color_scheme?.buttonSecondary || "#6b7280"};
        border-radius: 4px;
        padding: ${config.input_config?.padding || "12px 16px"};
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      `,
      minimal: `
        background: transparent;
        color: ${config.color_scheme?.buttonPrimary || "#3b82f6"};
        border: none;
        border-radius: 4px;
        padding: ${config.input_config?.padding || "12px 16px"};
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      `,
      rounded: `
        background: ${config.color_scheme?.buttonPrimary || "#3b82f6"};
        color: ${config.color_scheme?.buttonText || "#ffffff"};
        border: none;
        border-radius: 24px;
        padding: ${config.input_config?.padding || "12px 16px"};
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      `,
    };
    return styles[style] || styles.modern;
  };

  const generatePreviewHTML = (
    chatbotId: string,
    config: any,
    previewMode: string = "desktop",
  ) => {
    const headerConfig = config.header_config || {};
    const bubbleConfig = config.bubble_config || {};
    const inputConfig = config.input_config || {};
    const footerConfig = config.footer_config || {};
    const animationConfig = config.animation_config || {};
    const typography = config.typography || {};
    const colorScheme = config.color_scheme || {};

    const headerHeight = headerConfig.headerHeight || "60px";
    const headerTitle = headerConfig.customTitle || config.name || "Assistant";
    const showHeader = headerConfig.showHeader !== false;
    const fontFamily = typography.fontFamily || "Inter, sans-serif";
    const bubbleAnimation =
      bubbleConfig.animation || animationConfig.messageAnimation || "fade";
    const transitionDuration = animationConfig.transitionDuration || "300ms";
    const borderRadius = bubbleConfig.borderRadius || "18px";
    const messageSpacing = bubbleConfig.spacing || "8px";
    const showTail = bubbleConfig.showTail !== false;
    const shadow = bubbleConfig.shadow || "light";
    const inputPlaceholder = inputConfig.placeholder || "Type your message...";
    const inputHeight = inputConfig.height || "48px";
    const buttonStyle = inputConfig.buttonStyle || "modern";
    const showSendButton = inputConfig.showSendButton !== false;

    const shadowCSS = getShadowCSS(shadow);
    const animationKeyframes = getAnimationKeyframes(bubbleAnimation);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      font-family: ${fontFamily};
      background: ${colorScheme.background || "#ffffff"};
    }

    ${animationKeyframes}

    .chatbot-widget {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: ${colorScheme.background || "#ffffff"};
      border: 1px solid ${colorScheme.inputBorder || "#e0e0e0"};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* HEADER */
    ${
      showHeader
        ? `
      .chatbot-header {
        background: ${colorScheme.header || "#1e293b"};
        color: ${colorScheme.headerText || "#ffffff"};
        padding: 16px;
        text-align: center;
        font-weight: ${typography.headerWeight || "600"};
        font-size: ${typography.headerSize || "18px"};
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
        height: ${headerHeight};
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `
        : `.chatbot-header { display: none; }`
    }

    /* MESSAGES AREA */
    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: ${messageSpacing};
      background: ${colorScheme.background || "#ffffff"};
    }

    .chatbot-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
      background: ${colorScheme.inputBorder || "#e0e0e0"};
      border-radius: 3px;
    }

    /* MESSAGE BUBBLES */
    .message {
      display: flex;
      gap: 10px;
      align-items: flex-end;
      animation: ${bubbleAnimation !== "none" ? `${bubbleAnimation}In ${transitionDuration} ease-out` : "none"};
      max-width: 85%;
    }

    .message.bot {
      align-self: flex-start;
    }

    .message.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${colorScheme.header || "#1e293b"};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: ${borderRadius};
      font-size: ${typography.messageSize || "14px"};
      font-weight: ${typography.messageWeight || "400"};
      line-height: 1.5;
      position: relative;
      box-shadow: ${shadowCSS};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      word-wrap: break-word;
    }

    .message-bubble:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .message.bot .message-bubble {
      background: ${colorScheme.botMessage || "#f1f5f9"};
      color: ${colorScheme.botMessageText || "#1e293b"};
      border-bottom-left-radius: ${showTail ? "4px" : borderRadius};
    }

    .message.user .message-bubble {
      background: ${colorScheme.userMessage || "#3b82f6"};
      color: ${colorScheme.userMessageText || "#ffffff"};
      border-bottom-right-radius: ${showTail ? "4px" : borderRadius};
    }

    ${
      showTail
        ? `
      .message.bot .message-bubble::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: -6px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 0 8px 8px;
        border-color: transparent transparent ${colorScheme.botMessage || "#f1f5f9"} transparent;
      }

      .message.user .message-bubble::before {
        content: '';
        position: absolute;
        bottom: 0;
        right: -6px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 8px 8px 0;
        border-color: transparent ${colorScheme.userMessage || "#3b82f6"} transparent transparent;
      }
    `
        : ""
    }

    /* INPUT AREA */
    .chatbot-input-container {
      flex-shrink: 0;
      padding: 16px;
      border-top: 1px solid ${colorScheme.inputBorder || "#e0e0e0"};
      background: ${colorScheme.inputField || "#ffffff"};
    }

    .chatbot-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .input-field {
      flex: 1;
      height: ${inputHeight};
      padding: 0 16px;
      border: 1px solid ${colorScheme.inputBorder || "#e0e0e0"};
      border-radius: ${inputConfig.borderRadius || "24px"};
      font-family: ${fontFamily};
      font-size: ${typography.inputSize || "14px"};
      color: ${colorScheme.inputText || "#1e293b"};
      background: ${colorScheme.inputField || "#ffffff"};
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-field:focus {
      border-color: ${colorScheme.buttonPrimary || "#3b82f6"};
      box-shadow: 0 0 0 3px ${colorScheme.buttonPrimary || "#3b82f6"}33;
    }

    .input-field::placeholder {
      color: ${colorScheme.placeholderText || "#9ca3af"};
    }

    ${
      showSendButton
        ? `
      .send-button {
        width: ${inputConfig.buttonSize || "40px"};
        height: ${inputConfig.buttonSize || "40px"};
        border-radius: ${buttonStyle === "rounded" ? "50%" : "8px"};
        background: ${colorScheme.buttonPrimary || "#3b82f6"};
        color: ${colorScheme.buttonText || "#ffffff"};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .send-button:hover {
        background: ${colorScheme.buttonSecondary || "#2563eb"};
        transform: scale(1.05);
      }

      .send-button:active {
        transform: scale(0.95);
      }
    `
        : ".send-button { display: none; }"
    }

    /* FOOTER */
    ${
      footerConfig.showPoweredBy
        ? `
      .chatbot-footer {
        flex-shrink: 0;
        padding: 8px 16px;
        text-align: center;
        font-size: 11px;
        color: ${colorScheme.secondaryText || "#6b7280"};
        border-top: 1px solid ${colorScheme.inputBorder || "#e0e0e0"};
        background: ${colorScheme.background || "#ffffff"};
      }

      .chatbot-footer a {
        color: ${colorScheme.buttonPrimary || "#3b82f6"};
        text-decoration: none;
        font-weight: 500;
      }

      .chatbot-footer a:hover {
        text-decoration: underline;
      }
    `
        : ".chatbot-footer { display: none; }"
    }
  </style>
</head>
<body>
  <div class="chatbot-widget">
    ${
      showHeader
        ? `
      <div class="chatbot-header">
        <div>${headerTitle}</div>
      </div>
    `
        : ""
    }

    <div class="chatbot-messages">
      <!-- Bot Message -->
      <div class="message bot">
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
          ${config.starting_phrase || "Hi there! How can I help you today?"}
        </div>
      </div>

      <!-- User Message Example -->
      <div class="message user">
        <div class="message-avatar">👤</div>
        <div class="message-bubble">
          Hello! I'd like some information.
        </div>
      </div>

      <!-- Bot Response -->
      <div class="message bot">
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
          Of course! I'm here to assist you. What would you like to know?
        </div>
      </div>
    </div>

    <div class="chatbot-input-container">
      <div class="chatbot-input-wrapper">
        <input 
          type="text" 
          class="input-field" 
          placeholder="${inputPlaceholder}"
          disabled
        />
        ${showSendButton ? '<button class="send-button">⏎</button>' : ""}
      </div>
    </div>

    ${
      footerConfig.showPoweredBy
        ? `
      <div class="chatbot-footer">
        ${
          footerConfig.customBrandingText
            ? `<a href="${footerConfig.customBrandingUrl || "#"}" target="_blank">${footerConfig.customBrandingText}</a>`
            : '<a href="#" target="_blank">Powered by Yvexan Agency</a>'
        }
      </div>
    `
        : ""
    }
  </div>
</body>
</html>
    `;
  };

  return (
    <div className={className}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 rounded-lg shadow-sm"
        title="Chatbot Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

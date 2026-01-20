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

  const generatePreviewHTML = (chatbotId: string, config: any) => {
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
    const messageAnimation = animationConfig.messageAnimation || "fade";
    const transitionDuration = animationConfig.transitionDuration || "300ms";
    const bubbleAnimation =
      bubbleConfig.animation || animationConfig.messageAnimation || "fade";
    const borderRadius = bubbleConfig.borderRadius || "18px";
    const messageSpacing = bubbleConfig.spacing || "8px";
    const maxWidth = bubbleConfig.maxWidth || "80%";
    const tailSize = bubbleConfig.tailSize || "8px";
    const showTail = bubbleConfig.showTail !== false;
    const shadow = bubbleConfig.shadow || "light";
    const showTimestamp = bubbleConfig.showTimestamp || false;
    const showAvatar = bubbleConfig.showAvatar || false;
    const inputPlaceholder = inputConfig.placeholder || "Type your message...";
    const inputHeight = inputConfig.height || "48px";
    const inputBorderRadius = inputConfig.borderRadius || "24px";
    const inputPadding = inputConfig.padding || "12px 16px";
    const buttonSize = inputConfig.buttonSize || "36px";
    const buttonStyle = inputConfig.buttonStyle || "modern";
    const showSendButton = inputConfig.showSendButton !== false;
    const showCharacterCount = inputConfig.showCharacterCount || false;
    const maxCharacters = inputConfig.maxCharacters || "500";
    const hoverEffects = animationConfig.hoverEffects !== false;

    const shadowCSS = getShadowCSS(shadow);
    const animationKeyframes = getAnimationKeyframes(bubbleAnimation);
    const buttonStyleCSS = getButtonStyleCSS(buttonStyle);

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
    }

    body {
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      background: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    ${animationKeyframes}

    .chatbot-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${colorScheme.background || "#ffffff"};
      border: 1px solid ${colorScheme.inputBorder || "#e5e7eb"};
    }

    ${
      showHeader
        ? `
    .chatbot-header {
      background: ${colorScheme.header || "#0f172a"};
      color: ${colorScheme.headerText || "#ffffff"};
      padding: 16px;
      text-align: center;
      font-weight: ${typography.headerWeight || "600"};
      font-size: ${typography.headerSize || "18px"};
      border-bottom: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
      height: ${headerHeight};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    `
        : `.chatbot-header { display: none; }`
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: ${messageSpacing};
      justify-content: flex-start;
      background: ${colorScheme.background || "#ffffff"};
    }

    .message {
      display: flex;
      gap: 8px;
      animation: ${
        bubbleAnimation !== "none"
          ? `${bubbleAnimation}In ${transitionDuration} ease-out`
          : "none"
      };
      margin-bottom: ${messageSpacing};
    }

    .message.bot {
      align-self: flex-start;
      ${
        bubbleConfig.alignment === "center"
          ? "margin-left: auto; margin-right: auto;"
          : bubbleConfig.alignment === "right"
          ? "align-self: flex-end;"
          : ""
      }
    }

    .message.user {
      align-self: flex-end;
      ${
        bubbleConfig.alignment === "center"
          ? "margin-left: auto; margin-right: auto;"
          : ""
      }
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: ${borderRadius};
      word-wrap: break-word;
      font-size: ${typography.messageSize || "14px"};
      font-weight: ${typography.messageWeight || "400"};
      line-height: 1.4;
      max-width: ${maxWidth};
      width: fit-content;
      box-shadow: ${shadowCSS};
      ${hoverEffects ? "transition: all 0.2s ease;" : ""}
    }

    ${
      hoverEffects
        ? `
    .message-bubble:hover {
      transform: translateY(-2px);
      box-shadow: ${
        shadowCSS === "none"
          ? "0 1px 3px rgba(0, 0, 0, 0.1)"
          : shadowCSS.replace(
              /rgba\(0, 0, 0, ([\d.]+)\)/,
              (match, opacity) =>
                `rgba(0, 0, 0, ${Math.min(1, parseFloat(opacity) + 0.1)})`
            )
      };
    }
    `
        : ""
    }

    .message.bot .message-bubble {
      background: ${colorScheme.botMessage || "#f3f4f6"};
      color: ${colorScheme.textPrimary || "#1f2937"};
      ${showTail ? `position: relative;` : ""}
    }

    ${
      showTail
        ? `
    .message.bot .message-bubble::before {
      content: '';
      position: absolute;
      left: -${tailSize};
      top: 12px;
      width: 0;
      height: 0;
      border-top: ${tailSize} solid transparent;
      border-bottom: ${tailSize} solid transparent;
      border-right: ${tailSize} solid ${colorScheme.botMessage || "#f3f4f6"};
    }
    `
        : ""
    }

    .message.user .message-bubble {
      background: ${colorScheme.userMessage || "#3b82f6"};
      color: ${colorScheme.buttonText || "#ffffff"};
      ${showTail ? `position: relative;` : ""}
    }

    ${
      showTail
        ? `
    .message.user .message-bubble::after {
      content: '';
      position: absolute;
      right: -${tailSize};
      top: 12px;
      width: 0;
      height: 0;
      border-top: ${tailSize} solid transparent;
      border-bottom: ${tailSize} solid transparent;
      border-left: ${tailSize} solid ${colorScheme.userMessage || "#3b82f6"};
    }
    `
        : ""
    }

    ${
      showTimestamp
        ? `
    .message-time {
      font-size: 12px;
      color: ${colorScheme.textSecondary || "#9ca3af"};
      margin-top: 4px;
      font-weight: 400;
    }
    `
        : ""
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${colorScheme.accent || "#8b5cf6"};
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }

    .chatbot-input-area {
      background: ${colorScheme.background || "#ffffff"};
      border-top: 1px solid ${colorScheme.inputBorder || "#e5e7eb"};
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .input-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .input-field {
      flex: 1;
      border: 1px solid ${colorScheme.inputBorder || "#d1d5db"};
      border-radius: ${inputBorderRadius};
      padding: ${inputPadding};
      font-family: inherit;
      font-size: ${typography.inputSize || "14px"};
      font-weight: ${typography.inputWeight || "400"};
      background: ${colorScheme.inputField || "#ffffff"};
      color: ${colorScheme.textPrimary || "#1f2937"};
      height: ${inputHeight};
      ${hoverEffects ? "transition: all 0.2s ease;" : ""}
    }

    ${
      hoverEffects
        ? `
    .input-field:hover {
      border-color: ${colorScheme.buttonPrimary || "#3b82f6"};
    }

    .input-field:focus {
      outline: none;
      border-color: ${colorScheme.buttonPrimary || "#3b82f6"};
      box-shadow: 0 0 0 3px ${colorScheme.buttonPrimary || "#3b82f6"}33;
    }
    `
        : ""
    }

    .input-field::placeholder {
      color: ${colorScheme.textSecondary || "#9ca3af"};
    }

    ${
      showCharacterCount
        ? `
    .character-count {
      font-size: 12px;
      color: ${colorScheme.textSecondary || "#9ca3af"};
      margin-top: 4px;
      text-align: right;
    }
    `
        : ""
    }

    .send-button {
      ${buttonStyleCSS}
      width: ${buttonSize};
      height: ${inputHeight};
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    ${
      hoverEffects
        ? `
    .send-button:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }

    .send-button:active {
      transform: scale(0.95);
    }
    `
        : ""
    }

    ${
      footerConfig.showPoweredBy
        ? `
    .chatbot-footer {
      background: ${colorScheme.background || "#ffffff"};
      border-top: 1px solid ${colorScheme.inputBorder || "#e5e7eb"};
      padding: 12px 16px;
      text-align: center;
      font-size: 11px;
      color: ${colorScheme.textSecondary || "#9ca3af"};
      flex-shrink: 0;
    }

    .chatbot-footer a {
      color: ${colorScheme.accent || "#8b5cf6"};
      text-decoration: none;
    }

    .chatbot-footer a:hover {
      text-decoration: underline;
    }
    `
        : `.chatbot-footer { display: none; }`
    }
  </style>
</head>
<body>
  <div class="chatbot-container">
    ${showHeader ? `<div class="chatbot-header">${headerTitle}</div>` : ""}

    <div class="chatbot-messages">
      <div class="message bot">
        ${showAvatar ? '<div class="message-avatar">🤖</div>' : ""}
        <div>
          <div class="message-bubble">
            ${config.starting_phrase || "Hi there! How can I help you today?"}
          </div>
          ${showTimestamp ? '<div class="message-time">12:00 PM</div>' : ""}
        </div>
      </div>
      <div class="message user">
        ${showAvatar ? '<div class="message-avatar">You</div>' : ""}
        <div>
          <div class="message-bubble">
            Hello! I'd like to know more.
          </div>
          ${showTimestamp ? '<div class="message-time">12:01 PM</div>' : ""}
        </div>
      </div>
      <div class="message bot">
        ${showAvatar ? '<div class="message-avatar">🤖</div>' : ""}
        <div>
          <div class="message-bubble">
            I'm here to help! Feel free to ask me anything.
          </div>
          ${showTimestamp ? '<div class="message-time">12:01 PM</div>' : ""}
        </div>
      </div>
    </div>

    <div class="chatbot-input-area">
      <div class="input-wrapper">
        <input
          type="text"
          class="input-field"
          placeholder="${inputPlaceholder}"
          maxlength="${maxCharacters}"
        />
        ${
          showCharacterCount
            ? `<div class="character-count"><span class="char-count">0</span>/${maxCharacters}</div>`
            : ""
        }
      </div>
      ${showSendButton ? '<button class="send-button">⏎</button>' : ""}
    </div>

    ${
      footerConfig.showPoweredBy
        ? `<div class="chatbot-footer">
        ${
          footerConfig.customBrandingText
            ? `<a href="${footerConfig.customBrandingUrl || "#"}">${
                footerConfig.customBrandingText
              }</a>`
            : '<a href="#">Powered by Yvexan Agency</a>'
        }
      </div>`
        : ""
    }
  </div>

  ${
    showCharacterCount
      ? `<script>
    const inputField = document.querySelector('.input-field');
    const charCount = document.querySelector('.char-count');
    if (inputField && charCount) {
      inputField.addEventListener('input', () => {
        charCount.textContent = inputField.value.length;
      });
    }
  </script>`
      : ""
  }
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

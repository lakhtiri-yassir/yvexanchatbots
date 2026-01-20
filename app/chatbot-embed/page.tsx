"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface ChatbotConfig {
  name: string;
  starting_phrase: string;
  owner_name: string;
  bot_avatar_url?: string;
  color_scheme?: any;
  typography?: any;
  header_config?: any;
  bubble_config?: any;
  input_config?: any;
  footer_config?: any;
  animation_config?: any;
}

export default function ChatbotEmbedPage() {
  const searchParams = useSearchParams();
  const chatbotId = searchParams.get("id");
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chatbot config
  useEffect(() => {
    const loadChatbot = async () => {
      if (!chatbotId) return;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", chatbotId)
        .single();

      if (data && !error) {
        setConfig(data);
        setMessages([
          {
            id: "1",
            role: "bot",
            content:
              data.starting_phrase || "Hi there! How can I help you today?",
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadChatbot();
  }, [chatbotId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content:
          "Thanks for your message! This is a preview of how the chatbot would respond. In production, this would be connected to your AI model.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 500);
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: config?.color_scheme?.background || "#f0f0f0" }}
    >
      {/* Header */}
      <div
        className="text-white px-4 py-4 shadow-md flex justify-between items-center"
        style={{ backgroundColor: config?.color_scheme?.header || "#0f172a" }}
      >
        <div>
          <h1
            className="font-semibold text-lg"
            style={{ fontSize: config?.typography?.headerSize || "18px" }}
          >
            {config?.name || "Support Assistant"}
          </h1>
          <p className="text-sm opacity-90">
            Online • Usually replies instantly
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ gap: config?.bubble_config?.spacing || "8px" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg`}
              style={{
                backgroundColor:
                  message.role === "user"
                    ? config?.color_scheme?.userMessage || "#3b82f6"
                    : config?.color_scheme?.botMessage || "#f3f4f6",
                color:
                  message.role === "user"
                    ? config?.color_scheme?.buttonText || "#ffffff"
                    : config?.color_scheme?.textPrimary || "#1f2937",
                borderRadius: config?.bubble_config?.borderRadius || "18px",
                animation: config?.animation_config?.messageAnimation
                  ? `${config.animation_config.messageAnimation}In ${
                      config.animation_config.transitionDuration || "300ms"
                    } ease-out`
                  : "none",
                fontSize: config?.typography?.messageSize || "14px",
                fontFamily:
                  config?.typography?.fontFamily || "Inter, sans-serif",
                fontWeight: config?.typography?.messageWeight || "400",
              }}
            >
              <p className="text-sm">{message.content}</p>
              {config?.bubble_config?.showTimestamp && (
                <p
                  className={`text-xs mt-1`}
                  style={{
                    color:
                      message.role === "user"
                        ? "rgba(255,255,255,0.7)"
                        : config?.color_scheme?.textSecondary || "#9ca3af",
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: config?.color_scheme?.botMessage || "#f3f4f6",
                borderRadius: config?.bubble_config?.borderRadius || "18px",
              }}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 shadow-md">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

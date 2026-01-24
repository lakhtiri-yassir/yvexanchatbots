"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatbotEmbedPage() {
  const searchParams = useSearchParams();
  const chatbotId = searchParams.get("id");
  const [chatbot, setChatbot] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatbotId) {
      fetchChatbot();
    }
  }, [chatbotId]);

  async function fetchChatbot() {
    const { data } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", chatbotId)
      .single();
    
    if (data) {
      setChatbot(data);
      setMessages([
        {
          role: "bot",
          content: data.starting_phrase || "Hi! How can I help you?",
          timestamp: new Date(),
        },
      ]);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbotId,
          message: input,
          sessionId: "preview-" + Date.now(),
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.message, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!chatbot) return <div>Loading...</div>;

  const colors = chatbot.color_scheme || {};
  const typography = chatbot.typography || {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: typography.fontFamily || "Inter, sans-serif",
        background: colors.background || "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: colors.header || "#1a1a1a",
          color: "#ffffff",
          padding: "16px",
          fontSize: typography.headerSize || "16px",
          fontWeight: typography.headerWeight || "600",
        }}
      >
        {chatbot.name}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                background:
                  msg.role === "user"
                    ? colors.userMessage || "#007bff"
                    : colors.botMessage || "#f1f1f1",
                color:
                  msg.role === "user"
                    ? "#ffffff"
                    : colors.textPrimary || "#000000",
                padding: "12px 16px",
                borderRadius: "18px",
                maxWidth: "75%",
                fontSize: typography.messageSize || "14px",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: "#666" }}>Typing...</div>}
      </div>

      {/* Input */}
      <div style={{ padding: "16px", borderTop: "1px solid #ddd" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: "24px",
              outline: "none",
              fontSize: typography.inputSize || "14px",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: colors.buttonPrimary || "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              cursor: "pointer",
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
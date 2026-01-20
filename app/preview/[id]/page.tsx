"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function PreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatbotId = params.id as string;
  const mode = (searchParams.get("mode") || "desktop") as
    | "desktop"
    | "tablet"
    | "mobile";
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Load the chatbot embed script
    if (iframeRef.current && isWidgetOpen) {
      const embedScript = `
        <script src="https://yvexanchatbots.netlify.app/chatbot-widget.js"></script>
        <script>
          window.yvexanChatbot = {
            chatbotId: '${chatbotId}',
            apiUrl: 'https://yvexanchatbots.netlify.app'
          };
        </script>
      `;

      const iframeDoc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(embedScript);
        iframeDoc.close();
      }
    }
  }, [chatbotId, isWidgetOpen]);

  if (mode === "desktop") {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
        {/* Browser Chrome */}
        <div className="flex flex-col h-full">
          {/* Address Bar */}
          <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
              🌐
            </div>
            <div className="flex-1 bg-gray-800 rounded px-3 py-2 text-gray-400 text-sm">
              https://example.com
            </div>
          </div>

          {/* Website Content */}
          <div className="flex-1 bg-white overflow-hidden relative">
            {/* Sample Website Content */}
            <div className="w-full h-full overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-8">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to Our Service
                </h1>
                <p className="text-lg opacity-90">
                  Get instant support from our AI-powered chatbot
                </p>
              </div>

              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  How Can We Help?
                </h2>
                <p className="text-gray-600 mb-6">
                  Click the chatbot button in the bottom right corner to start
                  chatting with our AI assistant. We&apos;re here to help with
                  any questions you might have.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {["Feature 1", "Feature 2", "Feature 3"].map((feature) => (
                    <div
                      key={feature}
                      className="bg-gray-100 p-6 rounded-lg text-center"
                    >
                      <h3 className="font-semibold text-gray-800">{feature}</h3>
                      <p className="text-sm text-gray-600 mt-2">
                        Description of this feature
                      </p>
                    </div>
                  ))}
                </div>

                <div className="prose max-w-none">
                  {[...Array(3)].map((_, i) => (
                    <p key={i} className="text-gray-600 mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Chatbot Widget Button */}
            <button
              onClick={() => setIsWidgetOpen(!isWidgetOpen)}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
              aria-label="Open chatbot"
            >
              {isWidgetOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              )}
            </button>

            {/* Chatbot Widget Popup */}
            {isWidgetOpen && (
              <div className="fixed bottom-24 right-6 z-40 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                {/* Chat Widget Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Support Assistant</h3>
                    <p className="text-sm opacity-90">Online</p>
                  </div>
                  <button
                    onClick={() => setIsWidgetOpen(false)}
                    className="text-white hover:opacity-80"
                  >
                    ✕
                  </button>
                </div>

                {/* Chat Messages */}
                <iframe
                  ref={iframeRef}
                  title="Chatbot Widget"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />

                {/* Chat Input - Will be provided by iframe */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "tablet") {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8">
        {/* Tablet Frame */}
        <div
          style={{ width: "768px", height: "1024px" }}
          className="bg-black rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden flex flex-col"
        >
          {/* Status Bar */}
          <div className="bg-black text-white px-6 py-2 text-center text-sm font-semibold">
            9:41 ●●●●●●●●●● 100%
          </div>

          {/* Screen Content */}
          <iframe
            title="Chatbot Preview - Tablet"
            className="flex-1 border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            src={`/chatbot-embed?id=${chatbotId}`}
          />
        </div>
      </div>
    );
  }

  if (mode === "mobile") {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8">
        {/* Mobile Frame */}
        <div
          style={{ width: "375px", height: "667px" }}
          className="bg-black rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden flex flex-col relative"
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>

          {/* Status Bar */}
          <div className="bg-black text-white px-4 py-2 text-center text-xs font-semibold pt-6">
            9:41 ●●●●●●●●●● 100%
          </div>

          {/* Screen Content */}
          <iframe
            title="Chatbot Preview - Mobile"
            className="flex-1 border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            src={`/chatbot-embed?id=${chatbotId}`}
          />
        </div>
      </div>
    );
  }

  return null;
}

"use client";

import React, { useState } from "react";
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

  // Desktop View
  if (mode === "desktop") {
    return (
      <div className="w-full h-screen bg-white flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-white">
            🌐
          </div>
          <div className="flex-1 bg-gray-800 rounded px-3 py-2 text-gray-400 text-sm">
            https://example.com
          </div>
        </div>

        <div className="flex-1 bg-white overflow-y-auto relative">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 px-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Service</h1>
            <p className="text-lg opacity-90">
              Get instant support from our AI-powered chatbot
            </p>
          </div>

          <div className="p-8 max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              How Can We Help?
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Click the chatbot button in the bottom right corner to start
              chatting with our AI assistant.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-12">
              {["Feature 1", "Feature 2", "Feature 3"].map((feature) => (
                <div
                  key={feature}
                  className="bg-gray-100 p-8 rounded-lg text-center hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {feature}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Description of this feature
                  </p>
                </div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <p key={i} className="text-gray-600 mb-4 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>

          <button
            onClick={() => setIsWidgetOpen(!isWidgetOpen)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            {isWidgetOpen ? (
              <svg
                className="w-8 h-8"
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
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            )}
          </button>

          {isWidgetOpen && (
            <div className="fixed bottom-28 right-6 z-40 w-full max-w-md h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
              <iframe
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
                src={`/chatbot-embed?id=${chatbotId}`}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tablet View
  if (mode === "tablet") {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div
          className="bg-black rounded-3xl shadow-2xl border-12 border-gray-800 flex flex-col"
          style={{ width: "768px", height: "1024px" }}
        >
          <div
            className="absolute top-0 left-1/2 w-24 h-1.5 bg-black rounded-full"
            style={{ transform: "translateX(-50%)" }}
          ></div>
          <div className="bg-black text-white px-6 py-3 text-center text-sm font-semibold flex justify-between items-center">
            <span>9:41</span>
            <span>●●●●●●●●●●</span>
            <span>100%</span>
          </div>
          <iframe
            className="flex-1 w-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            src={`/chatbot-embed?id=${chatbotId}`}
          />
        </div>
      </div>
    );
  }

  // Mobile View
  if (mode === "mobile") {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div
          className="bg-black rounded-3xl shadow-2xl border-12 border-gray-800 flex flex-col relative"
          style={{ width: "375px", height: "667px" }}
        >
          <div
            className="absolute top-0 left-1/2 w-48 h-6 bg-black rounded-b-3xl"
            style={{ transform: "translateX(-50%)", zIndex: 20 }}
          ></div>
          <div className="bg-black text-white px-4 py-2 text-center text-xs font-semibold flex justify-between items-center pt-5">
            <span>9:41</span>
            <span>●●●●●●●●●●</span>
            <span>100%</span>
          </div>
          <iframe
            className="flex-1 w-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            src={`/chatbot-embed?id=${chatbotId}`}
          />
        </div>
      </div>
    );
  }

  return null;
}

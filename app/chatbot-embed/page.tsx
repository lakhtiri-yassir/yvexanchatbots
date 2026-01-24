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
                src={`/embed/${chatbotId}`}
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
            src={`/embed/${chatbotId}`}
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
          className="relative bg-black rounded-[3rem] shadow-2xl border-8 border-gray-900 flex flex-col"
          style={{
            width: "375px",
            height: "812px",
            boxShadow:
              "0 0 0 2px #1f2937, 0 20px 60px rgba(0,0,0,0.5), inset 0 0 6px rgba(255,255,255,0.1)",
          }}
        >
          <div className="absolute top-0 left-1/2 w-40 h-7 bg-black rounded-b-3xl transform -translate-x-1/2 z-50 flex items-center justify-center">
            <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-2"></div>
          </div>

          <div className="flex-1 bg-white overflow-hidden flex flex-col relative rounded-[2.5rem]">
            <div className="bg-white px-4 py-3 text-center text-xs font-semibold flex justify-between items-center border-b border-gray-200 relative z-10 pt-8">
              <span className="text-gray-900">9:41</span>
              <span className="text-gray-400">●●●●●●●●●●</span>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                </svg>
                <span className="text-gray-900 font-bold">100%</span>
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-b from-blue-50 to-white overflow-y-auto relative">
              <div className="p-6">
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                      AI
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        AI Assistant
                      </h2>
                      <p className="text-sm text-gray-500">Always here to help</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our AI chatbot is ready to assist you 24/7. Click the chat
                    button below to get started.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-4/5"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                </div>
              </div>

              <div className="absolute bottom-6 right-5 z-50">
                <button
                  onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                  className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 relative"
                  style={{
                    boxShadow:
                      "0 8px 32px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
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
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  )}

                  {!isWidgetOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  )}
                </button>
              </div>

              {isWidgetOpen && (
                <div
                  className="absolute inset-0 bg-white z-40 flex flex-col animate-slideUp"
                  style={{
                    animation: "slideUp 0.3s ease-out forwards",
                  }}
                >
                  <iframe
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    src={`/embed/${chatbotId}`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-50">
            <div className="w-36 h-1.5 bg-white rounded-full opacity-90"></div>
          </div>

          <div className="absolute left-0 top-28 w-1 h-12 bg-slate-900 rounded-r-sm"></div>
          <div className="absolute left-0 top-44 w-1 h-12 bg-slate-900 rounded-r-sm"></div>
          <div className="absolute right-0 top-36 w-1 h-16 bg-slate-900 rounded-l-sm"></div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
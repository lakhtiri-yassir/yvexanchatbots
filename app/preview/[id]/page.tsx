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
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
        {/* iPhone 14 Pro Style Frame */}
        <div
          className="bg-black rounded-[3.5rem] shadow-2xl relative overflow-hidden"
          style={{ width: "390px", height: "844px" }}
        >
          {/* Outer Phone Border */}
          <div className="absolute inset-0 rounded-[3.5rem] border-[14px] border-slate-900 pointer-events-none z-30"></div>

          {/* Dynamic Island Notch (iPhone 14 Pro style) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-black rounded-b-[2rem] h-9 w-36 flex items-center justify-center mt-2">
              <div className="w-16 h-5 bg-slate-950 rounded-full"></div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 pt-3 pb-1">
            <div className="px-8 flex justify-between items-center">
              {/* Left Side - Time */}
              <div className="text-white text-sm font-semibold tracking-tight">
                9:41
              </div>

              {/* Right Side - Icons */}
              <div className="flex items-center gap-1.5">
                {/* Cellular Signal */}
                <svg
                  className="w-4 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="1" y="14" width="4" height="10" rx="1" />
                  <rect x="7" y="10" width="4" height="14" rx="1" />
                  <rect x="13" y="6" width="4" height="18" rx="1" />
                  <rect x="19" y="2" width="4" height="22" rx="1" />
                </svg>

                {/* WiFi */}
                <svg
                  className="w-4 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-4c-2.21 0-4 1.79-4 4h1.71c.46-1.25 1.66-2.14 3.04-2.14s2.58.89 3.04 2.14H17c0-2.21-1.79-4-4-4zm0-4c-3.31 0-6 2.69-6 6h1.71c.46-2.85 2.94-5.07 5.83-5.07s5.37 2.22 5.83 5.07H21c0-3.31-2.69-6-6-6z" />
                </svg>

                {/* Battery */}
                <div className="flex items-center gap-0.5">
                  <div className="text-white text-xs font-medium">100%</div>
                  <svg
                    className="w-6 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 12"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="18"
                      height="10"
                      rx="2"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="2.5"
                      y="2.5"
                      width="15"
                      height="7"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="20"
                      y="3.5"
                      width="2.5"
                      height="5"
                      rx="1"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Screen Content */}
          <div className="absolute inset-0 mt-12 mb-8 mx-1 rounded-[2.5rem] overflow-hidden bg-white">
            {/* Mobile Website Mockup */}
            <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-white">
              {/* Mobile Browser Bar */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600">
                  example.com
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              {/* Website Content */}
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome
                    </h1>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Get instant support from our AI assistant
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {["Feature 1", "Feature 2"].map((feature, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-lg">✨</span>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-800 mb-1">
                          {feature}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Quick description
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      💬 Need help? Our AI chatbot is ready to assist you 24/7.
                      Click the chat button below to get started.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-4/5"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Floating Chatbot Button - Bottom Right */}
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

                  {/* Notification Badge */}
                  {!isWidgetOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Chatbot Widget Popup (Full Screen Mobile Style) */}
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

          {/* Home Indicator (iPhone style) */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-50">
            <div className="w-36 h-1.5 bg-white rounded-full opacity-90"></div>
          </div>

          {/* Volume Buttons (Left Side) */}
          <div className="absolute left-0 top-28 w-1 h-12 bg-slate-900 rounded-r-sm"></div>
          <div className="absolute left-0 top-44 w-1 h-12 bg-slate-900 rounded-r-sm"></div>

          {/* Power Button (Right Side) */}
          <div className="absolute right-0 top-36 w-1 h-16 bg-slate-900 rounded-l-sm"></div>
        </div>

        {/* Add slideUp animation */}
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

"use client";

import { useChatbot } from "../chatbot-context";
import { DesignPanel } from "@/components/ui/design-panel";
import { ChatbotPreview } from "@/components/ui/chatbot-preview";
import { Skeleton } from "@/components/ui/skeleton";

export default function DesignPage() {
  const { chatbot, updateChatbot, loading } = useChatbot();

  if (loading || !chatbot) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full mt-4" />
      </div>
    );
  }

  // Dummy functions for props that are not used on this page
  const handlePreview = () => {};
  const handleVoicePreview = async () => {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Design Panel - Left Side */}
      <div className="lg:col-span-2">
        <DesignPanel
          config={chatbot}
          onChange={(updatedConfig) => updateChatbot(updatedConfig)}
          onPreview={handlePreview}
          voiceEnabled={chatbot.voice_enabled}
          availableVoices={[]} // Pass empty or fetch if needed
          onVoicePreview={handleVoicePreview}
        />
      </div>

      {/* Live Preview - Right Side */}
      <div className="lg:col-span-2">
        <div className="sticky top-8 bg-white rounded-lg border border-gray-200 p-4 h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
            Live Preview
          </h3>
          <div className="flex-1 min-h-0">
            <ChatbotPreview
              chatbotId={chatbot.id}
              config={chatbot}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

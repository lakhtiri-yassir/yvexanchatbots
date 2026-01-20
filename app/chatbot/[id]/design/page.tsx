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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Design Panel - Left Side */}
      <div className="lg:col-span-2 overflow-y-auto">
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
      <div className="lg:col-span-2 flex flex-col">
        <div className="sticky top-0 z-10 pt-4 pb-2 bg-white">
          <h3 className="text-lg font-semibold">Live Preview</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatbotPreview
            chatbotId={chatbot.id}
            config={chatbot}
            className="w-full h-full min-h-96"
          />
        </div>
      </div>
    </div>
  );
}

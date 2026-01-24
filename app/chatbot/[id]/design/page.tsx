"use client";

import { useState } from "react";
import { useChatbot } from "../chatbot-context";
import { DesignPanel } from "@/components/ui/design-panel";
import { ChatbotPreview } from "@/components/ui/chatbot-preview";
import { ThemeLibrary } from "@/components/ui/theme-library";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DesignPage() {
  const { chatbot, updateChatbot, loading } = useChatbot();
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  if (loading || !chatbot) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full mt-4" />
      </div>
    );
  }

  // Open preview in new window with the selected mode
  const handlePreview = () => {
    const modeParams = {
      desktop: "width=1400,height=900",
      tablet: "width=800,height=1100",
      mobile: "width=420,height=750",
    };

    const previewUrl = `/preview/${chatbot.id}?mode=${previewMode}`;
    window.open(previewUrl, "chatbot-preview", modeParams[previewMode]);
  };
  const handleVoicePreview = async () => {};

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customize" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="library">Theme Library</TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Design Panel - Left Side */}
            <div className="lg:col-span-2">
              <DesignPanel
                config={chatbot}
                onChange={(updatedConfig) => updateChatbot(updatedConfig)}
                onPreview={handlePreview}
                onPreviewModeChange={setPreviewMode}
                voiceEnabled={chatbot.voice_enabled}
                availableVoices={[]}
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
                    previewMode={previewMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <div className="max-w-4xl mx-auto">
            <ThemeLibrary
              chatbotId={chatbot.id}
              onThemeApplied={() => {
                window.location.reload();
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useChatbot } from "../chatbot-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic } from "lucide-react";

const VOICE_MODELS = [
  { value: "eleven_monolingual_v1", label: "Monolingual V1 (English)" },
  { value: "eleven_multilingual_v1", label: "Multilingual V1" },
  { value: "eleven_multilingual_v2", label: "Multilingual V2 (Latest)" },
];

export default function VoicePage() {
  const { chatbot, updateChatbot, loading } = useChatbot();

  if (loading || !chatbot) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const updateVoiceConfig = (key: string, value: any) => {
    updateChatbot({
      voice_config: {
        ...chatbot.voice_config,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Voice Integration</h2>
        <p className="text-muted-foreground">
          Add voice capabilities using ElevenLabs (optional)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-orange-600" />
            <span>Voice Integration</span>
          </CardTitle>
          <CardDescription>
            Add voice capabilities using ElevenLabs (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="voice_enabled"
              checked={chatbot.voice_enabled || false}
              onCheckedChange={(checked) =>
                updateChatbot({ voice_enabled: checked })
              }
            />
            <Label htmlFor="voice_enabled" className="text-sm font-medium">
              Enable Voice
            </Label>
          </div>

          {chatbot.voice_enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="elevenlabs_api_key"
                    className="text-sm font-medium"
                  >
                    ElevenLabs API Key
                  </Label>
                  <Input
                    id="elevenlabs_api_key"
                    type="password"
                    value={chatbot.elevenlabs_api_key || ""}
                    onChange={(e) =>
                      updateChatbot({ elevenlabs_api_key: e.target.value })
                    }
                    placeholder="Enter your ElevenLabs API key"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice_id" className="text-sm font-medium">
                    Voice
                  </Label>
                  <Select
                    value={chatbot.voice_id || ""}
                    onValueChange={(value) =>
                      updateChatbot({ voice_id: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice1">Voice 1</SelectItem>
                      <SelectItem value="voice2">Voice 2</SelectItem>
                      <SelectItem value="voice3">Voice 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stability" className="text-sm font-medium">
                      Stability
                    </Label>
                    <Input
                      id="stability"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={chatbot.voice_settings?.stability || 0.5}
                      onChange={(e) =>
                        updateChatbot({
                          voice_settings: {
                            ...chatbot.voice_settings,
                            stability: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {chatbot.voice_settings?.stability || 0.5}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="similarity_boost"
                      className="text-sm font-medium"
                    >
                      Similarity
                    </Label>
                    <Input
                      id="similarity_boost"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={chatbot.voice_settings?.similarity_boost || 0.5}
                      onChange={(e) =>
                        updateChatbot({
                          voice_settings: {
                            ...chatbot.voice_settings,
                            similarity_boost: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {chatbot.voice_settings?.similarity_boost || 0.5}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-sm font-medium">
                      Style
                    </Label>
                    <Input
                      id="style"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={chatbot.voice_settings?.style || 0.5}
                      onChange={(e) =>
                        updateChatbot({
                          voice_settings: {
                            ...chatbot.voice_settings,
                            style: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {chatbot.voice_settings?.style || 0.5}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Voice Configuration */}
      {chatbot.voice_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-5 w-5" />
              <span>Voice Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select
                value={chatbot.voice_config?.model || "eleven_monolingual_v1"}
                onValueChange={(value) => updateVoiceConfig("model", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Voice Speed</Label>
              <div className="px-3">
                <Slider
                  value={[chatbot.voice_config?.voiceSpeed || 1]}
                  onValueChange={([value]) =>
                    updateVoiceConfig("voiceSpeed", value)
                  }
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>
                    {(chatbot.voice_config?.voiceSpeed || 1).toFixed(1)}x
                  </span>
                  <span>2.0x</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={chatbot.voice_config?.autoDetectLanguage || false}
                  onCheckedChange={(checked) =>
                    updateVoiceConfig("autoDetectLanguage", checked)
                  }
                />
                <Label>Auto Detect Language</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={chatbot.voice_config?.streamingMode || false}
                  onCheckedChange={(checked) =>
                    updateVoiceConfig("streamingMode", checked)
                  }
                />
                <Label>Streaming Mode</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={chatbot.voice_config?.autoReadMessages || false}
                  onCheckedChange={(checked) =>
                    updateVoiceConfig("autoReadMessages", checked)
                  }
                />
                <Label>Auto Read Messages</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={chatbot.voice_config?.pushToTalk || false}
                  onCheckedChange={(checked) =>
                    updateVoiceConfig("pushToTalk", checked)
                  }
                />
                <Label>Push to Talk</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={chatbot.voice_config?.outputFormat || "mp3_44100_128"}
                onValueChange={(value) =>
                  updateVoiceConfig("outputFormat", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3_44100_128">
                    MP3 44.1kHz 128kbps
                  </SelectItem>
                  <SelectItem value="mp3_44100_192">
                    MP3 44.1kHz 192kbps
                  </SelectItem>
                  <SelectItem value="pcm_16000">PCM 16kHz</SelectItem>
                  <SelectItem value="pcm_22050">PCM 22.05kHz</SelectItem>
                  <SelectItem value="pcm_24000">PCM 24kHz</SelectItem>
                  <SelectItem value="pcm_44100">PCM 44.1kHz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

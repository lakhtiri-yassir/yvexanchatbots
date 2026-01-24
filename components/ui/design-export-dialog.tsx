"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Copy, Check, Save } from "lucide-react";
import {
  exportDesignToFile,
  exportDesignToClipboard,
  getExportData,
} from "@/lib/design/export";
import { saveThemeToLibrary } from "@/app/chatbot/[id]/design/actions";
import { toast } from "sonner";

interface DesignExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: any;
  chatbotName?: string;
}

export function DesignExportDialog({
  open,
  onOpenChange,
  config,
  chatbotName,
}: DesignExportDialogProps) {
  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tagsArray = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const exportData = themeName
    ? getExportData(config, {
        themeName,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        chatbotName,
      })
    : null;

  const handleDownload = () => {
    if (!themeName) {
      toast.error("Please enter a theme name");
      return;
    }

    exportDesignToFile(config, {
      themeName,
      description: description || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      chatbotName,
    });

    toast.success("Design exported successfully!");
  };

  const handleCopyToClipboard = async () => {
    if (!themeName) {
      toast.error("Please enter a theme name");
      return;
    }

    try {
      await exportDesignToClipboard(config, {
        themeName,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        chatbotName,
      });

      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSaveToLibrary = async () => {
    if (!themeName) {
      toast.error("Please enter a theme name");
      return;
    }

    setSaving(true);

    try {
      const exportData = getExportData(config, {
        themeName,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        chatbotName,
      });

      const result = await saveThemeToLibrary({
        themeName,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        designConfig: exportData.design,
      });

      if (result.success) {
        toast.success("Theme saved to library!");
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(result.error || "Failed to save theme");
      }
    } catch (error) {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setThemeName("");
    setDescription("");
    setTags("");
    setSaveToLibrary(false);
    setShowPreview(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Design Theme</DialogTitle>
          <DialogDescription>
            Export your chatbot design as a JSON file or save to your theme
            library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Theme Name */}
          <div className="space-y-2">
            <Label htmlFor="theme-name">
              Theme Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="theme-name"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g., Modern Blue Corporate"
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              {themeName.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Professional blue theme for enterprise applications"
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {description.length}/200 characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="professional, blue, corporate"
            />
            <p className="text-xs text-gray-500">
              Comma-separated tags (max 5)
            </p>
            {tagsArray.length > 5 && (
              <p className="text-xs text-red-500">
                Too many tags (maximum 5 allowed)
              </p>
            )}
          </div>

          {/* Save to Library Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-library"
              checked={saveToLibrary}
              onCheckedChange={(checked) =>
                setSaveToLibrary(checked as boolean)
              }
            />
            <Label
              htmlFor="save-library"
              className="font-normal cursor-pointer"
            >
              Save to my theme library
            </Label>
          </div>

          {/* Preview Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full"
          >
            {showPreview ? "Hide" : "Show"} JSON Preview
          </Button>

          {/* JSON Preview */}
          {showPreview && exportData && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono">
                {JSON.stringify(exportData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyToClipboard}
            disabled={!themeName || tagsArray.length > 5}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!themeName || tagsArray.length > 5}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .json
          </Button>

          {saveToLibrary && (
            <Button
              type="button"
              onClick={handleSaveToLibrary}
              disabled={!themeName || tagsArray.length > 5 || saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save to Library"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

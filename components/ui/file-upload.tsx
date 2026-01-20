"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import the supabase client

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  userId: string;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
}

export function FileUpload({
  onUpload,
  currentUrl,
  userId,
  accept = "image/*",
  maxSize = 5,
  label = "Upload Image",
  description = "Upload an image file",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // Get the user's session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated for upload.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: {
          // Send the token in the Authorization header
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Failed to upload image: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-sm text-gray-600">{description}</p>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300 shadow-sm"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md hover:shadow-lg"
            onClick={handleRemove}
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label htmlFor="file-upload" className="flex">
          <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
            <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-xs text-gray-600 mt-2 font-medium">
              Upload
            </span>
          </div>
        </label>
      )}

      <Input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500">Max size: {maxSize}MB</p>
        {uploading && (
          <p className="text-xs text-blue-600 font-medium">Uploading...</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useChatbot } from "../chatbot-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Database, Upload, Trash2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UploadedFile {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  created_at: string;
  file_path: string;
}

export default function KnowledgePage() {
  const { chatbot, updateChatbot, loading } = useChatbot();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch uploaded files
  useEffect(() => {
    if (chatbot?.id) {
      fetchUploadedFiles();
    }
  }, [chatbot?.id]);

  const fetchUploadedFiles = async () => {
    try {
      setFilesLoading(true);
      const { data, error } = await supabase
        .from("knowledge_base_files")
        .select("*")
        .eq("chatbot_id", chatbot?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setUploadedFiles(data || []);
      }
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!files || files.length === 0 || !chatbot) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${chatbot.user_id}/${chatbot.id}/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("knowledge-base")
          .upload(filePath, file);

        if (uploadError) {
          console.error("File upload error:", uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from("knowledge_base_files")
          .insert({
            chatbot_id: chatbot.id,
            user_id: chatbot.user_id,
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: fileExt || "unknown",
          });

        if (dbError) {
          console.error("Database error:", dbError);
          alert(`Failed to save ${file.name} to database: ${dbError.message}`);
        }
      }

      // Refresh the file list
      await fetchUploadedFiles();
      setFiles(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("knowledge-base")
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        alert("Failed to delete file from storage");
        return;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("knowledge_base_files")
        .delete()
        .eq("id", fileId);

      if (dbError) {
        console.error("Database delete error:", dbError);
        alert("Failed to delete file record");
        return;
      }

      // Refresh the file list
      await fetchUploadedFiles();
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading || !chatbot) {
    return (
      <div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
        <p className="text-muted-foreground">
          Upload documents to give your chatbot access to specific information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <span>Upload New Files</span>
          </CardTitle>
          <CardDescription>
            Upload documents to give your chatbot access to specific information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="files" className="text-sm font-medium">
              Select Files
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="files"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, TXT, DOCX files only
                  </p>
                </div>
                <input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {files && files.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected files:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 mb-3">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name} ({formatFileSize(file.size)})
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Uploaded Files</span>
          </CardTitle>
          <CardDescription>
            Manage your knowledge base documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : uploadedFiles.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No files uploaded yet
            </p>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)} •{" "}
                        {file.file_type.toUpperCase()} •{" "}
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id, file.file_path)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

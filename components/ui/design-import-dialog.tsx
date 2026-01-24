"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  readDesignFile,
  parseDesignImport,
  applyImport,
  formatValidationErrors,
} from "@/lib/design/import";
import { ValidationResult } from "@/lib/design/schema";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DesignImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig: any;
  onApplyImport: (newConfig: any) => void;
}

export function DesignImportDialog({
  open,
  onOpenChange,
  currentConfig,
  onApplyImport,
}: DesignImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Import options
  const [importColors, setImportColors] = useState(true);
  const [importTypography, setImportTypography] = useState(true);
  const [importLayout, setImportLayout] = useState(true);
  const [importComponents, setImportComponents] = useState(true);
  const [importAnimations, setImportAnimations] = useState(true);

  const validateInput = useCallback((input: string) => {
    if (!input.trim()) {
      setValidationResult(null);
      return;
    }

    const result = parseDesignImport(input);
    setValidationResult(result);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a .json file");
      return;
    }

    const result = await readDesignFile(file);
    setValidationResult(result);

    if (result.success && result.data) {
      setJsonInput(JSON.stringify(result.data, null, 2));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleApply = () => {
    if (!validationResult?.success || !validationResult.data) {
      toast.error("Please fix validation errors before applying");
      return;
    }

    const newConfig = applyImport(currentConfig, validationResult.data, {
      importColors,
      importTypography,
      importLayout,
      importComponents,
      importAnimations,
    });

    onApplyImport(newConfig);
    toast.success("Design theme applied successfully!");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setJsonInput("");
    setValidationResult(null);
    setImportColors(true);
    setImportTypography(true);
    setImportLayout(true);
    setImportComponents(true);
    setImportAnimations(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Design Theme</DialogTitle>
          <DialogDescription>
            Upload a .json file or paste JSON to import a design theme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop a .json file here, or click to browse
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse Files
            </Button>
          </div>

          {/* JSON Text Area */}
          <div className="space-y-2">
            <Label htmlFor="json-input">Or paste JSON here:</Label>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                validateInput(e.target.value);
              }}
              placeholder='{ "metadata": { ... }, "design": { ... } }'
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <Alert
              variant={validationResult.success ? "default" : "destructive"}
            >
              {validationResult.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Valid design theme!</strong>
                    <br />
                    Theme: {validationResult.data?.metadata.themeName}
                    {validationResult.data?.metadata.description && (
                      <>
                        <br />
                        {validationResult.data.metadata.description}
                      </>
                    )}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Errors:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {formatValidationErrors(
                        validationResult.errors || [],
                      ).map((error, i) => (
                        <li key={i} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {/* Import Options */}
          {validationResult?.success && (
            <div className="space-y-3 border rounded-lg p-4">
              <Label className="text-sm font-semibold">Import Options:</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-colors"
                    checked={importColors}
                    onCheckedChange={(checked) =>
                      setImportColors(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="import-colors"
                    className="font-normal cursor-pointer"
                  >
                    Colors
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-typography"
                    checked={importTypography}
                    onCheckedChange={(checked) =>
                      setImportTypography(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="import-typography"
                    className="font-normal cursor-pointer"
                  >
                    Typography
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-layout"
                    checked={importLayout}
                    onCheckedChange={(checked) =>
                      setImportLayout(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="import-layout"
                    className="font-normal cursor-pointer"
                  >
                    Layout
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-components"
                    checked={importComponents}
                    onCheckedChange={(checked) =>
                      setImportComponents(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="import-components"
                    className="font-normal cursor-pointer"
                  >
                    Components
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="import-animations"
                    checked={importAnimations}
                    onCheckedChange={(checked) =>
                      setImportAnimations(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="import-animations"
                    className="font-normal cursor-pointer"
                  >
                    Animations
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            disabled={!validationResult?.success}
            className="flex-1"
          >
            Apply Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Design Export Utility
 *
 * Handles exporting design configurations to JSON files
 */

import { configToExport } from "./transformer";
import { DesignExportFormat } from "./schema";

/**
 * Export design configuration to JSON file
 */
export function exportDesignToFile(
  config: any,
  metadata: {
    themeName: string;
    description?: string;
    tags?: string[];
    chatbotName?: string;
  },
): void {
  const exportData = configToExport(config, metadata);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(metadata.themeName)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export design to clipboard as JSON string
 */
export async function exportDesignToClipboard(
  config: any,
  metadata: {
    themeName: string;
    description?: string;
    tags?: string[];
    chatbotName?: string;
  },
): Promise<void> {
  const exportData = configToExport(config, metadata);
  const jsonString = JSON.stringify(exportData, null, 2);
  await navigator.clipboard.writeText(jsonString);
}

/**
 * Get export data as object (for saving to database)
 */
export function getExportData(
  config: any,
  metadata: {
    themeName: string;
    description?: string;
    tags?: string[];
    chatbotName?: string;
  },
): DesignExportFormat {
  return configToExport(config, metadata);
}

/**
 * Generate preview thumbnail as base64 (placeholder - will be enhanced)
 */
export async function generatePreviewThumbnail(
  config: any,
): Promise<string | null> {
  // Placeholder: Return null for now
  // Future enhancement: Generate actual preview image
  return null;
}

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

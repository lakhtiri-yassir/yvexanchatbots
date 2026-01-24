/**
 * Design Import Utility
 *
 * Handles importing design configurations from JSON files
 */

import { validateDesignImport } from "./validator";
import { exportToConfig, mergePartialExport } from "./transformer";
import { ValidationResult, DesignExportFormat } from "./schema";

/**
 * Parse and validate JSON string
 */
export function parseDesignImport(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateDesignImport(parsed);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: "root",
          message: `Invalid JSON: ${error instanceof Error ? error.message : "Parse error"}`,
        },
      ],
    };
  }
}

/**
 * Read file and parse design import
 */
export async function readDesignFile(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        resolve({
          success: false,
          errors: [{ field: "root", message: "Failed to read file content" }],
        });
        return;
      }

      resolve(parseDesignImport(content));
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: [{ field: "root", message: "Failed to read file" }],
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Apply validated import to config
 */
export function applyImport(
  currentConfig: any,
  importData: DesignExportFormat,
  options: {
    importColors?: boolean;
    importTypography?: boolean;
    importLayout?: boolean;
    importComponents?: boolean;
    importAnimations?: boolean;
  } = {
    importColors: true,
    importTypography: true,
    importLayout: true,
    importComponents: true,
    importAnimations: true,
  },
): any {
  return mergePartialExport(currentConfig, importData, options);
}

/**
 * Get human-readable error messages
 */
export function formatValidationErrors(
  errors: Array<{ field: string; message: string; value?: any }>,
): string[] {
  return errors.map((error) => {
    const fieldName = error.field.split(".").pop() || error.field;
    if (error.value !== undefined) {
      return `${error.message} (current value: ${error.value})`;
    }
    return error.message;
  });
}

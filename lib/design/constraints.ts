/**
 * Design Validation Constraints
 *
 * Defines min/max boundaries for all design values to prevent
 * invalid configurations that could break the chatbot UI.
 */

export interface ConstraintRange {
  min: string;
  max: string;
  default?: string;
}

export const DESIGN_CONSTRAINTS = {
  layout: {
    widget_width: { min: "200px", max: "800px", default: "350px" },
    widget_height: { min: "300px", max: "1000px", default: "500px" },
    border_radius: { min: "0px", max: "50px", default: "12px" },
    widget_padding: { min: "0px", max: "50px", default: "16px" },
    widget_margin: { min: "0px", max: "100px", default: "20px" },
  },

  typography: {
    headerSize: { min: "12px", max: "48px", default: "18px" },
    messageSize: { min: "10px", max: "24px", default: "14px" },
    inputSize: { min: "10px", max: "20px", default: "14px" },
    headerWeight: {
      allowed: ["300", "400", "500", "600", "700"],
      default: "600",
    },
    messageWeight: {
      allowed: ["300", "400", "500", "600"],
      default: "400",
    },
    inputWeight: {
      allowed: ["300", "400", "500"],
      default: "400",
    },
  },

  components: {
    header: {
      headerHeight: { min: "40px", max: "120px", default: "60px" },
      logoSize: { min: "16px", max: "64px", default: "32px" },
    },
    bubbles: {
      spacing: { min: "0px", max: "32px", default: "8px" },
      maxWidth: { min: "50%", max: "95%", default: "80%" },
      borderRadius: { min: "0px", max: "50px", default: "18px" },
      tailSize: { min: "4px", max: "20px", default: "8px" },
      alignment: {
        allowed: ["left", "right", "center"],
        default: "left",
      },
      animation: {
        allowed: ["fade", "slideUp", "slideLeft", "scale", "bounce", "none"],
        default: "fade",
      },
      shadow: {
        allowed: ["none", "light", "medium", "heavy"],
        default: "light",
      },
    },
    input: {
      height: { min: "32px", max: "80px", default: "46px" },
      buttonSize: { min: "24px", max: "60px", default: "34px" },
      maxCharacters: { min: "50", max: "5000", default: "500" },
      buttonStyle: {
        allowed: ["modern", "classic", "minimal", "rounded"],
        default: "modern",
      },
    },
  },

  advanced: {
    transitionDuration: { min: "0ms", max: "2000ms", default: "300ms" },
  },
};

export const COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
export const PIXEL_REGEX = /^\d+px$/;
export const PERCENT_REGEX = /^\d+%$/;
export const TIME_REGEX = /^\d+(ms|s)$/;

/**
 * Parse pixel value to number
 */
export function parsePixels(value: string): number {
  return parseInt(value.replace("px", ""), 10);
}

/**
 * Parse percentage value to number
 */
export function parsePercent(value: string): number {
  return parseInt(value.replace("%", ""), 10);
}

/**
 * Parse time value to milliseconds
 */
export function parseTime(value: string): number {
  if (value.endsWith("ms")) {
    return parseInt(value.replace("ms", ""), 10);
  } else if (value.endsWith("s")) {
    return parseInt(value.replace("s", ""), 10) * 1000;
  }
  return 0;
}

/**
 * Validate if value is within range
 */
export function isInRange(value: string, constraint: ConstraintRange): boolean {
  // Handle different units
  if (PIXEL_REGEX.test(value)) {
    const num = parsePixels(value);
    const min = parsePixels(constraint.min);
    const max = parsePixels(constraint.max);
    return num >= min && num <= max;
  }

  if (PERCENT_REGEX.test(value)) {
    const num = parsePercent(value);
    const min = parsePercent(constraint.min);
    const max = parsePercent(constraint.max);
    return num >= min && num <= max;
  }

  if (TIME_REGEX.test(value)) {
    const num = parseTime(value);
    const min = parseTime(constraint.min);
    const max = parseTime(constraint.max);
    return num >= min && num <= max;
  }

  return false;
}

/**
 * Validate color hex format
 */
export function isValidColor(color: string): boolean {
  return COLOR_REGEX.test(color);
}

/**
 * Validate if value is in allowed list
 */
export function isAllowedValue(value: string, allowed: string[]): boolean {
  return allowed.includes(value);
}

/**
 * Design Import Validator
 *
 * Validates imported design JSON against schema and constraints
 */

import {
  DesignExportFormat,
  ValidationResult,
  ValidationError,
  SCHEMA_VERSION,
} from "./schema";
import {
  DESIGN_CONSTRAINTS,
  isValidColor,
  isInRange,
  isAllowedValue,
} from "./constraints";

/**
 * Validate complete design import
 */
export function validateDesignImport(json: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if JSON is an object
  if (!json || typeof json !== "object") {
    return {
      success: false,
      errors: [{ field: "root", message: "Invalid JSON: must be an object" }],
    };
  }

  const data = json as any;

  // Validate metadata
  if (!data.metadata) {
    errors.push({ field: "metadata", message: "Missing metadata section" });
  } else {
    validateMetadata(data.metadata, errors);
  }

  // Validate design
  if (!data.design) {
    errors.push({ field: "design", message: "Missing design section" });
  } else {
    validateDesign(data.design, errors);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as DesignExportFormat };
}

function validateMetadata(metadata: any, errors: ValidationError[]) {
  // Version
  if (!metadata.version) {
    errors.push({ field: "metadata.version", message: "Missing version" });
  } else if (typeof metadata.version !== "string") {
    errors.push({
      field: "metadata.version",
      message: "Version must be a string",
    });
  } else if (!isCompatibleVersion(metadata.version)) {
    errors.push({
      field: "metadata.version",
      message: `Incompatible version. Expected ${SCHEMA_VERSION}, got ${metadata.version}`,
    });
  }

  // Exported At
  if (!metadata.exportedAt) {
    errors.push({
      field: "metadata.exportedAt",
      message: "Missing exportedAt timestamp",
    });
  } else if (typeof metadata.exportedAt !== "string") {
    errors.push({
      field: "metadata.exportedAt",
      message: "exportedAt must be a string",
    });
  }

  // Theme Name
  if (!metadata.themeName) {
    errors.push({ field: "metadata.themeName", message: "Missing theme name" });
  } else if (typeof metadata.themeName !== "string") {
    errors.push({
      field: "metadata.themeName",
      message: "Theme name must be a string",
    });
  } else if (metadata.themeName.length < 1 || metadata.themeName.length > 50) {
    errors.push({
      field: "metadata.themeName",
      message: "Theme name must be 1-50 characters",
    });
  }

  // Description (optional)
  if (metadata.description && typeof metadata.description !== "string") {
    errors.push({
      field: "metadata.description",
      message: "Description must be a string",
    });
  } else if (metadata.description && metadata.description.length > 200) {
    errors.push({
      field: "metadata.description",
      message: "Description must be 200 characters or less",
    });
  }

  // Tags (optional)
  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push({ field: "metadata.tags", message: "Tags must be an array" });
    } else if (metadata.tags.length > 5) {
      errors.push({
        field: "metadata.tags",
        message: "Maximum 5 tags allowed",
      });
    } else {
      metadata.tags.forEach((tag: any, index: number) => {
        if (typeof tag !== "string") {
          errors.push({
            field: `metadata.tags[${index}]`,
            message: "Tag must be a string",
          });
        } else if (tag.length > 20) {
          errors.push({
            field: `metadata.tags[${index}]`,
            message: "Tag must be 20 characters or less",
          });
        }
      });
    }
  }
}

function validateDesign(design: any, errors: ValidationError[]) {
  // Validate Layout
  if (!design.layout) {
    errors.push({
      field: "design.layout",
      message: "Missing layout configuration",
    });
  } else {
    validateLayout(design.layout, errors);
  }

  // Validate Colors
  if (!design.colors) {
    errors.push({
      field: "design.colors",
      message: "Missing colors configuration",
    });
  } else {
    validateColors(design.colors, errors);
  }

  // Validate Typography
  if (!design.typography) {
    errors.push({
      field: "design.typography",
      message: "Missing typography configuration",
    });
  } else {
    validateTypography(design.typography, errors);
  }

  // Validate Components
  if (!design.components) {
    errors.push({
      field: "design.components",
      message: "Missing components configuration",
    });
  } else {
    validateComponents(design.components, errors);
  }

  // Validate Advanced
  if (!design.advanced) {
    errors.push({
      field: "design.advanced",
      message: "Missing advanced configuration",
    });
  } else {
    validateAdvanced(design.advanced, errors);
  }

  // Validate Responsive
  if (!design.responsive) {
    errors.push({
      field: "design.responsive",
      message: "Missing responsive configuration",
    });
  } else {
    validateResponsive(design.responsive, errors);
  }
}

function validateLayout(layout: any, errors: ValidationError[]) {
  // UI Layout
  if (!layout.ui_layout || !["corner", "full"].includes(layout.ui_layout)) {
    errors.push({
      field: "design.layout.ui_layout",
      message: 'ui_layout must be "corner" or "full"',
    });
  }

  // Dimensions with constraints
  const dimensionFields = [
    "widget_width",
    "widget_height",
    "border_radius",
    "widget_padding",
    "widget_margin",
  ];
  dimensionFields.forEach((field) => {
    if (!layout[field]) {
      errors.push({
        field: `design.layout.${field}`,
        message: `Missing ${field}`,
      });
    } else if (typeof layout[field] !== "string") {
      errors.push({
        field: `design.layout.${field}`,
        message: `${field} must be a string`,
      });
    } else {
      const constraint =
        DESIGN_CONSTRAINTS.layout[
          field as keyof typeof DESIGN_CONSTRAINTS.layout
        ];
      if (constraint && !isInRange(layout[field], constraint)) {
        errors.push({
          field: `design.layout.${field}`,
          message: `${field} must be between ${constraint.min} and ${constraint.max}`,
          value: layout[field],
        });
      }
    }
  });
}

function validateColors(colors: any, errors: ValidationError[]) {
  const requiredColors = [
    "background",
    "header",
    "botMessage",
    "userMessage",
    "textPrimary",
    "textSecondary",
    "inputField",
    "inputBorder",
    "inputText",
    "buttonPrimary",
    "buttonSecondary",
    "accent",
    "success",
    "warning",
    "error",
  ];

  requiredColors.forEach((colorField) => {
    if (!colors[colorField]) {
      errors.push({
        field: `design.colors.${colorField}`,
        message: `Missing color: ${colorField}`,
      });
    } else if (typeof colors[colorField] !== "string") {
      errors.push({
        field: `design.colors.${colorField}`,
        message: `Color must be a string`,
      });
    } else if (!isValidColor(colors[colorField])) {
      errors.push({
        field: `design.colors.${colorField}`,
        message: `Invalid color format. Must be hex format (#RRGGBB)`,
        value: colors[colorField],
      });
    }
  });
}

function validateTypography(typography: any, errors: ValidationError[]) {
  // Font Family
  if (!typography.fontFamily || typeof typography.fontFamily !== "string") {
    errors.push({
      field: "design.typography.fontFamily",
      message: "Font family must be a string",
    });
  }

  // Font Sizes
  const sizeFields = ["headerSize", "messageSize", "inputSize"];
  sizeFields.forEach((field) => {
    if (!typography[field]) {
      errors.push({
        field: `design.typography.${field}`,
        message: `Missing ${field}`,
      });
    } else {
      const constraint =
        DESIGN_CONSTRAINTS.typography[
          field as keyof typeof DESIGN_CONSTRAINTS.typography
        ];
      if (
        constraint &&
        "min" in constraint &&
        !isInRange(typography[field], constraint)
      ) {
        errors.push({
          field: `design.typography.${field}`,
          message: `${field} must be between ${constraint.min} and ${constraint.max}`,
          value: typography[field],
        });
      }
    }
  });

  // Font Weights
  const weightFields = ["headerWeight", "messageWeight", "inputWeight"];
  weightFields.forEach((field) => {
    if (!typography[field]) {
      errors.push({
        field: `design.typography.${field}`,
        message: `Missing ${field}`,
      });
    } else {
      const constraint =
        DESIGN_CONSTRAINTS.typography[
          field as keyof typeof DESIGN_CONSTRAINTS.typography
        ];
      if (
        constraint &&
        "allowed" in constraint &&
        !isAllowedValue(typography[field], constraint.allowed)
      ) {
        errors.push({
          field: `design.typography.${field}`,
          message: `${field} must be one of: ${constraint.allowed.join(", ")}`,
          value: typography[field],
        });
      }
    }
  });
}

function validateComponents(components: any, errors: ValidationError[]) {
  if (!components.header) {
    errors.push({
      field: "design.components.header",
      message: "Missing header configuration",
    });
  } else {
    validateHeader(components.header, errors);
  }

  if (!components.bubbles) {
    errors.push({
      field: "design.components.bubbles",
      message: "Missing bubbles configuration",
    });
  } else {
    validateBubbles(components.bubbles, errors);
  }

  if (!components.input) {
    errors.push({
      field: "design.components.input",
      message: "Missing input configuration",
    });
  } else {
    validateInput(components.input, errors);
  }

  if (!components.footer) {
    errors.push({
      field: "design.components.footer",
      message: "Missing footer configuration",
    });
  } else {
    validateFooter(components.footer, errors);
  }
}

function validateHeader(header: any, errors: ValidationError[]) {
  // Boolean fields
  ["showHeader", "showLogo", "showOwnerName"].forEach((field) => {
    if (typeof header[field] !== "boolean") {
      errors.push({
        field: `design.components.header.${field}`,
        message: `${field} must be a boolean`,
      });
    }
  });

  // String fields
  if (typeof header.customTitle !== "string") {
    errors.push({
      field: "design.components.header.customTitle",
      message: "customTitle must be a string",
    });
  }

  // Dimension fields
  const constraint = DESIGN_CONSTRAINTS.components.header;
  if (
    header.headerHeight &&
    !isInRange(header.headerHeight, constraint.headerHeight)
  ) {
    errors.push({
      field: "design.components.header.headerHeight",
      message: `headerHeight must be between ${constraint.headerHeight.min} and ${constraint.headerHeight.max}`,
      value: header.headerHeight,
    });
  }

  if (header.logoSize && !isInRange(header.logoSize, constraint.logoSize)) {
    errors.push({
      field: "design.components.header.logoSize",
      message: `logoSize must be between ${constraint.logoSize.min} and ${constraint.logoSize.max}`,
      value: header.logoSize,
    });
  }
}

function validateBubbles(bubbles: any, errors: ValidationError[]) {
  // Boolean fields
  ["showTail", "showTimestamp", "showAvatar"].forEach((field) => {
    if (typeof bubbles[field] !== "boolean") {
      errors.push({
        field: `design.components.bubbles.${field}`,
        message: `${field} must be a boolean`,
      });
    }
  });

  // Enum fields
  const constraint = DESIGN_CONSTRAINTS.components.bubbles;

  if (
    bubbles.alignment &&
    !isAllowedValue(bubbles.alignment, constraint.alignment.allowed)
  ) {
    errors.push({
      field: "design.components.bubbles.alignment",
      message: `alignment must be one of: ${constraint.alignment.allowed.join(", ")}`,
      value: bubbles.alignment,
    });
  }

  if (
    bubbles.animation &&
    !isAllowedValue(bubbles.animation, constraint.animation.allowed)
  ) {
    errors.push({
      field: "design.components.bubbles.animation",
      message: `animation must be one of: ${constraint.animation.allowed.join(", ")}`,
      value: bubbles.animation,
    });
  }

  if (
    bubbles.shadow &&
    !isAllowedValue(bubbles.shadow, constraint.shadow.allowed)
  ) {
    errors.push({
      field: "design.components.bubbles.shadow",
      message: `shadow must be one of: ${constraint.shadow.allowed.join(", ")}`,
      value: bubbles.shadow,
    });
  }

  // Dimension fields
  ["spacing", "maxWidth", "borderRadius", "tailSize"].forEach((field) => {
    if (bubbles[field]) {
      const fieldConstraint = constraint[field as keyof typeof constraint];
      if (
        fieldConstraint &&
        "min" in fieldConstraint &&
        !isInRange(bubbles[field], fieldConstraint)
      ) {
        errors.push({
          field: `design.components.bubbles.${field}`,
          message: `${field} must be between ${fieldConstraint.min} and ${fieldConstraint.max}`,
          value: bubbles[field],
        });
      }
    }
  });
}

function validateInput(input: any, errors: ValidationError[]) {
  // Boolean fields
  [
    "showMicButton",
    "showSendButton",
    "autoFocus",
    "showCharacterCount",
  ].forEach((field) => {
    if (typeof input[field] !== "boolean") {
      errors.push({
        field: `design.components.input.${field}`,
        message: `${field} must be a boolean`,
      });
    }
  });

  // String fields
  if (typeof input.placeholder !== "string") {
    errors.push({
      field: "design.components.input.placeholder",
      message: "placeholder must be a string",
    });
  }

  // Button style
  const constraint = DESIGN_CONSTRAINTS.components.input;
  if (
    input.buttonStyle &&
    !isAllowedValue(input.buttonStyle, constraint.buttonStyle.allowed)
  ) {
    errors.push({
      field: "design.components.input.buttonStyle",
      message: `buttonStyle must be one of: ${constraint.buttonStyle.allowed.join(", ")}`,
      value: input.buttonStyle,
    });
  }

  // Dimension fields
  ["height", "buttonSize"].forEach((field) => {
    if (input[field]) {
      const fieldConstraint = constraint[field as keyof typeof constraint];
      if (
        fieldConstraint &&
        "min" in fieldConstraint &&
        !isInRange(input[field], fieldConstraint)
      ) {
        errors.push({
          field: `design.components.input.${field}`,
          message: `${field} must be between ${fieldConstraint.min} and ${fieldConstraint.max}`,
          value: input[field],
        });
      }
    }
  });
}

function validateFooter(footer: any, errors: ValidationError[]) {
  // Boolean fields
  ["showPoweredBy", "showCTA"].forEach((field) => {
    if (typeof footer[field] !== "boolean") {
      errors.push({
        field: `design.components.footer.${field}`,
        message: `${field} must be a boolean`,
      });
    }
  });

  // String fields
  ["customBrandingUrl", "customBrandingText", "ctaText", "ctaUrl"].forEach(
    (field) => {
      if (typeof footer[field] !== "string") {
        errors.push({
          field: `design.components.footer.${field}`,
          message: `${field} must be a string`,
        });
      }
    },
  );
}

function validateAdvanced(advanced: any, errors: ValidationError[]) {
  // Boolean fields
  ["typingIndicator", "soundEffects", "hoverEffects"].forEach((field) => {
    if (typeof advanced[field] !== "boolean") {
      errors.push({
        field: `design.advanced.${field}`,
        message: `${field} must be a boolean`,
      });
    }
  });

  // String fields
  if (typeof advanced.messageAnimation !== "string") {
    errors.push({
      field: "design.advanced.messageAnimation",
      message: "messageAnimation must be a string",
    });
  }

  // Transition duration
  const constraint = DESIGN_CONSTRAINTS.advanced.transitionDuration;
  if (
    advanced.transitionDuration &&
    !isInRange(advanced.transitionDuration, constraint)
  ) {
    errors.push({
      field: "design.advanced.transitionDuration",
      message: `transitionDuration must be between ${constraint.min} and ${constraint.max}`,
      value: advanced.transitionDuration,
    });
  }
}

function validateResponsive(responsive: any, errors: ValidationError[]) {
  // String fields (no strict validation - these are informational)
  ["mobileWidth", "mobileHeight", "tabletWidth", "tabletHeight"].forEach(
    (field) => {
      if (typeof responsive[field] !== "string") {
        errors.push({
          field: `design.responsive.${field}`,
          message: `${field} must be a string`,
        });
      }
    },
  );

  // Breakpoints
  if (!responsive.breakpoints) {
    errors.push({
      field: "design.responsive.breakpoints",
      message: "Missing breakpoints",
    });
  } else {
    if (typeof responsive.breakpoints.mobile !== "string") {
      errors.push({
        field: "design.responsive.breakpoints.mobile",
        message: "mobile breakpoint must be a string",
      });
    }
    if (typeof responsive.breakpoints.tablet !== "string") {
      errors.push({
        field: "design.responsive.breakpoints.tablet",
        message: "tablet breakpoint must be a string",
      });
    }
  }
}

function isCompatibleVersion(version: string): boolean {
  // For now, only accept exact version match
  // Future: implement semantic versioning compatibility
  return version === SCHEMA_VERSION;
}

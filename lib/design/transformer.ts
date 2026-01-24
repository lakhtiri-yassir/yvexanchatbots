/**
 * Design Configuration Transformer
 *
 * Converts between chatbot config format and export format
 */

import {
  DesignExportFormat,
  DesignConfiguration,
  SCHEMA_VERSION,
} from "./schema";

/**
 * Transform chatbot config to export format
 */
export function configToExport(
  config: any,
  metadata: {
    themeName: string;
    description?: string;
    tags?: string[];
    chatbotName?: string;
    exportedBy?: string;
  },
): DesignExportFormat {
  const design: DesignConfiguration = {
    layout: {
      ui_layout: config.ui_layout || "corner",
      widget_width: config.widget_width || "350px",
      widget_height: config.widget_height || "500px",
      border_radius: config.border_radius || "12px",
      widget_padding: config.widget_padding || "16px",
      widget_margin: config.widget_margin || "20px",
    },

    colors: {
      background: config.color_scheme?.background || "#ffffff",
      header: config.color_scheme?.header || "#000000",
      botMessage: config.color_scheme?.botMessage || "#f3f4f6",
      userMessage: config.color_scheme?.userMessage || "#3b82f6",
      textPrimary: config.color_scheme?.textPrimary || "#111827",
      textSecondary: config.color_scheme?.textSecondary || "#6b7280",
      inputField: config.color_scheme?.inputField || "#ffffff",
      inputBorder: config.color_scheme?.inputBorder || "#d1d5db",
      inputText: config.color_scheme?.inputText || "#111827",
      buttonPrimary: config.color_scheme?.buttonPrimary || "#3b82f6",
      buttonSecondary: config.color_scheme?.buttonSecondary || "#6b7280",
      accent: config.color_scheme?.accent || "#8b5cf6",
      success: config.color_scheme?.success || "#10b981",
      warning: config.color_scheme?.warning || "#f59e0b",
      error: config.color_scheme?.error || "#ef4444",
    },

    typography: {
      fontFamily:
        config.typography?.fontFamily ||
        "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      headerSize: config.typography?.headerSize || "18px",
      messageSize: config.typography?.messageSize || "14px",
      inputSize: config.typography?.inputSize || "14px",
      headerWeight: config.typography?.headerWeight || "600",
      messageWeight: config.typography?.messageWeight || "400",
      inputWeight: config.typography?.inputWeight || "400",
    },

    components: {
      header: {
        showHeader: config.header_config?.showHeader !== false,
        customTitle: config.header_config?.customTitle || "",
        showLogo: config.header_config?.showLogo !== false,
        showOwnerName: config.header_config?.showOwnerName || false,
        headerHeight: config.header_config?.headerHeight || "60px",
        logoSize: config.header_config?.logoSize || "32px",
      },

      bubbles: {
        showTail: config.bubble_config?.showTail !== false,
        alignment: config.bubble_config?.alignment || "left",
        animation: config.bubble_config?.animation || "fade",
        spacing: config.bubble_config?.spacing || "8px",
        maxWidth: config.bubble_config?.maxWidth || "80%",
        borderRadius: config.bubble_config?.borderRadius || "18px",
        tailSize: config.bubble_config?.tailSize || "8px",
        shadow: config.bubble_config?.shadow || "light",
        showTimestamp: config.bubble_config?.showTimestamp || false,
        showAvatar: config.bubble_config?.showAvatar || false,
      },

      input: {
        placeholder: config.input_config?.placeholder || "Type your message...",
        borderRadius: config.input_config?.borderRadius || "20px",
        showMicButton: config.input_config?.showMicButton || false,
        showSendButton: config.input_config?.showSendButton !== false,
        buttonStyle: config.input_config?.buttonStyle || "modern",
        height: config.input_config?.height || "46px",
        padding: config.input_config?.padding || "12px 16px",
        buttonSize: config.input_config?.buttonSize || "34px",
        autoFocus: config.input_config?.autoFocus || false,
        showCharacterCount: config.input_config?.showCharacterCount || false,
        maxCharacters: config.input_config?.maxCharacters || "500",
      },

      footer: {
        showPoweredBy: config.footer_config?.showPoweredBy !== false,
        customBrandingUrl: config.footer_config?.customBrandingUrl || "",
        customBrandingText:
          config.footer_config?.customBrandingText || "Powered by ChatBot",
        showCTA: config.footer_config?.showCTA || false,
        ctaText: config.footer_config?.ctaText || "",
        ctaUrl: config.footer_config?.ctaUrl || "",
      },
    },

    advanced: {
      messageAnimation: config.animation_config?.messageAnimation || "fade",
      typingIndicator: config.animation_config?.typingIndicator || false,
      soundEffects: config.animation_config?.soundEffects || false,
      hoverEffects: config.animation_config?.hoverEffects !== false,
      transitionDuration:
        config.animation_config?.transitionDuration || "300ms",
    },

    responsive: {
      mobileWidth: config.responsive_config?.mobileWidth || "100%",
      mobileHeight: config.responsive_config?.mobileHeight || "100%",
      tabletWidth: config.responsive_config?.tabletWidth || "600px",
      tabletHeight: config.responsive_config?.tabletHeight || "800px",
      breakpoints: {
        mobile: config.responsive_config?.breakpoints?.mobile || "768px",
        tablet: config.responsive_config?.breakpoints?.tablet || "1024px",
      },
    },
  };

  return {
    metadata: {
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      themeName: metadata.themeName,
      description: metadata.description,
      tags: metadata.tags,
      chatbotName: metadata.chatbotName,
      exportedBy: metadata.exportedBy,
    },
    design,
  };
}

/**
 * Transform export format back to chatbot config format
 */
export function exportToConfig(exportData: DesignExportFormat): any {
  const { design } = exportData;

  return {
    // Layout fields (top-level)
    ui_layout: design.layout.ui_layout,
    widget_width: design.layout.widget_width,
    widget_height: design.layout.widget_height,
    border_radius: design.layout.border_radius,
    widget_padding: design.layout.widget_padding,
    widget_margin: design.layout.widget_margin,

    // Color scheme (nested object)
    color_scheme: {
      background: design.colors.background,
      header: design.colors.header,
      botMessage: design.colors.botMessage,
      userMessage: design.colors.userMessage,
      textPrimary: design.colors.textPrimary,
      textSecondary: design.colors.textSecondary,
      inputField: design.colors.inputField,
      inputBorder: design.colors.inputBorder,
      inputText: design.colors.inputText,
      buttonPrimary: design.colors.buttonPrimary,
      buttonSecondary: design.colors.buttonSecondary,
      accent: design.colors.accent,
      success: design.colors.success,
      warning: design.colors.warning,
      error: design.colors.error,
    },

    // Typography (nested object)
    typography: {
      fontFamily: design.typography.fontFamily,
      headerSize: design.typography.headerSize,
      messageSize: design.typography.messageSize,
      inputSize: design.typography.inputSize,
      headerWeight: design.typography.headerWeight,
      messageWeight: design.typography.messageWeight,
      inputWeight: design.typography.inputWeight,
    },

    // Header config (nested object)
    header_config: {
      showHeader: design.components.header.showHeader,
      customTitle: design.components.header.customTitle,
      showLogo: design.components.header.showLogo,
      showOwnerName: design.components.header.showOwnerName,
      headerHeight: design.components.header.headerHeight,
      logoSize: design.components.header.logoSize,
    },

    // Bubble config (nested object)
    bubble_config: {
      showTail: design.components.bubbles.showTail,
      alignment: design.components.bubbles.alignment,
      animation: design.components.bubbles.animation,
      spacing: design.components.bubbles.spacing,
      maxWidth: design.components.bubbles.maxWidth,
      borderRadius: design.components.bubbles.borderRadius,
      tailSize: design.components.bubbles.tailSize,
      shadow: design.components.bubbles.shadow,
      showTimestamp: design.components.bubbles.showTimestamp,
      showAvatar: design.components.bubbles.showAvatar,
    },

    // Input config (nested object)
    input_config: {
      placeholder: design.components.input.placeholder,
      borderRadius: design.components.input.borderRadius,
      showMicButton: design.components.input.showMicButton,
      showSendButton: design.components.input.showSendButton,
      buttonStyle: design.components.input.buttonStyle,
      height: design.components.input.height,
      padding: design.components.input.padding,
      buttonSize: design.components.input.buttonSize,
      autoFocus: design.components.input.autoFocus,
      showCharacterCount: design.components.input.showCharacterCount,
      maxCharacters: design.components.input.maxCharacters,
    },

    // Footer config (nested object)
    footer_config: {
      showPoweredBy: design.components.footer.showPoweredBy,
      customBrandingUrl: design.components.footer.customBrandingUrl,
      customBrandingText: design.components.footer.customBrandingText,
      showCTA: design.components.footer.showCTA,
      ctaText: design.components.footer.ctaText,
      ctaUrl: design.components.footer.ctaUrl,
    },

    // Animation config (nested object)
    animation_config: {
      messageAnimation: design.advanced.messageAnimation,
      typingIndicator: design.advanced.typingIndicator,
      soundEffects: design.advanced.soundEffects,
      hoverEffects: design.advanced.hoverEffects,
      transitionDuration: design.advanced.transitionDuration,
    },

    // Responsive config (nested object)
    responsive_config: {
      mobileWidth: design.responsive.mobileWidth,
      mobileHeight: design.responsive.mobileHeight,
      tabletWidth: design.responsive.tabletWidth,
      tabletHeight: design.responsive.tabletHeight,
      breakpoints: {
        mobile: design.responsive.breakpoints.mobile,
        tablet: design.responsive.breakpoints.tablet,
      },
    },
  };
}

/**
 * Merge partial export into existing config
 * Allows selective import of specific sections
 */
export function mergePartialExport(
  currentConfig: any,
  exportData: DesignExportFormat,
  options: {
    importColors?: boolean;
    importTypography?: boolean;
    importLayout?: boolean;
    importComponents?: boolean;
    importAnimations?: boolean;
  },
): any {
  const newConfig = exportToConfig(exportData);
  const merged = { ...currentConfig };

  if (options.importLayout) {
    merged.ui_layout = newConfig.ui_layout;
    merged.widget_width = newConfig.widget_width;
    merged.widget_height = newConfig.widget_height;
    merged.border_radius = newConfig.border_radius;
    merged.widget_padding = newConfig.widget_padding;
    merged.widget_margin = newConfig.widget_margin;
  }

  if (options.importColors) {
    merged.color_scheme = newConfig.color_scheme;
  }

  if (options.importTypography) {
    merged.typography = newConfig.typography;
  }

  if (options.importComponents) {
    merged.header_config = newConfig.header_config;
    merged.bubble_config = newConfig.bubble_config;
    merged.input_config = newConfig.input_config;
    merged.footer_config = newConfig.footer_config;
  }

  if (options.importAnimations) {
    merged.animation_config = newConfig.animation_config;
    merged.responsive_config = newConfig.responsive_config;
  }

  return merged;
}

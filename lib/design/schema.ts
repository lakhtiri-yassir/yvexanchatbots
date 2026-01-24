/**
 * Design Export/Import Schema Definitions
 * Version: 1.0.0
 *
 * This file defines the TypeScript interfaces for exporting and importing
 * chatbot design configurations.
 */

export const SCHEMA_VERSION = "1.0.0";

export interface DesignExportMetadata {
  version: string;
  exportedAt: string;
  exportedBy?: string;
  chatbotName?: string;
  themeName: string;
  description?: string;
  tags?: string[];
  preview?: string;
}

export interface DesignLayout {
  ui_layout: "corner" | "full";
  widget_width: string;
  widget_height: string;
  border_radius: string;
  widget_padding: string;
  widget_margin: string;
}

export interface DesignColors {
  background: string;
  header: string;
  botMessage: string;
  userMessage: string;
  textPrimary: string;
  textSecondary: string;
  inputField: string;
  inputBorder: string;
  inputText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface DesignTypography {
  fontFamily: string;
  headerSize: string;
  messageSize: string;
  inputSize: string;
  headerWeight: string;
  messageWeight: string;
  inputWeight: string;
}

export interface DesignHeaderConfig {
  showHeader: boolean;
  customTitle: string;
  showLogo: boolean;
  showOwnerName: boolean;
  headerHeight: string;
  logoSize: string;
}

export interface DesignBubbleConfig {
  showTail: boolean;
  alignment: "left" | "right" | "center";
  animation: "fade" | "slideUp" | "slideLeft" | "scale" | "bounce" | "none";
  spacing: string;
  maxWidth: string;
  borderRadius: string;
  tailSize: string;
  shadow: "none" | "light" | "medium" | "heavy";
  showTimestamp: boolean;
  showAvatar: boolean;
}

export interface DesignInputConfig {
  placeholder: string;
  borderRadius: string;
  showMicButton: boolean;
  showSendButton: boolean;
  buttonStyle: "modern" | "classic" | "minimal" | "rounded";
  height: string;
  padding: string;
  buttonSize: string;
  autoFocus: boolean;
  showCharacterCount: boolean;
  maxCharacters: string;
}

export interface DesignFooterConfig {
  showPoweredBy: boolean;
  customBrandingUrl: string;
  customBrandingText: string;
  showCTA: boolean;
  ctaText: string;
  ctaUrl: string;
}

export interface DesignAdvancedConfig {
  messageAnimation: string;
  typingIndicator: boolean;
  soundEffects: boolean;
  hoverEffects: boolean;
  transitionDuration: string;
}

export interface DesignResponsiveConfig {
  mobileWidth: string;
  mobileHeight: string;
  tabletWidth: string;
  tabletHeight: string;
  breakpoints: {
    mobile: string;
    tablet: string;
  };
}

export interface DesignComponents {
  header: DesignHeaderConfig;
  bubbles: DesignBubbleConfig;
  input: DesignInputConfig;
  footer: DesignFooterConfig;
}

export interface DesignConfiguration {
  layout: DesignLayout;
  colors: DesignColors;
  typography: DesignTypography;
  components: DesignComponents;
  advanced: DesignAdvancedConfig;
  responsive: DesignResponsiveConfig;
}

export interface DesignExportFormat {
  metadata: DesignExportMetadata;
  design: DesignConfiguration;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: DesignExportFormat;
}

export interface SavedTheme {
  id: string;
  user_id: string;
  theme_name: string;
  description: string | null;
  tags: string[] | null;
  preview_image: string | null;
  design_config: DesignConfiguration;
  times_applied: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

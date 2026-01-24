"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DesignConfiguration } from "@/lib/design/schema";

/**
 * Save theme to user's library
 */
export async function saveThemeToLibrary(data: {
  themeName: string;
  description?: string;
  tags?: string[];
  designConfig: DesignConfiguration;
  previewImage?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("design_themes").insert({
    user_id: user.id,
    theme_name: data.themeName,
    description: data.description || null,
    tags: data.tags || null,
    design_config: data.designConfig,
    preview_image: data.previewImage || null,
  });

  if (error) {
    console.error("Error saving theme:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/chatbot/[id]/design");
  return { success: true };
}

/**
 * Load user's saved themes
 */
export async function getUserThemes() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized", themes: [] };
  }

  const { data, error } = await supabase
    .from("design_themes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching themes:", error);
    return { success: false, error: error.message, themes: [] };
  }

  return { success: true, themes: data || [] };
}

/**
 * Apply theme to chatbot
 */
export async function applyThemeToBot(chatbotId: string, themeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get theme
  const { data: theme, error: themeError } = await supabase
    .from("design_themes")
    .select("design_config")
    .eq("id", themeId)
    .single();

  if (themeError || !theme) {
    return { success: false, error: "Theme not found" };
  }

  // Apply theme to chatbot
  const designConfig = theme.design_config as any;

  const { error: updateError } = await supabase
    .from("chatbots")
    .update({
      // Layout
      ui_layout: designConfig.layout?.ui_layout,
      widget_width: designConfig.layout?.widget_width,
      widget_height: designConfig.layout?.widget_height,
      border_radius: designConfig.layout?.border_radius,
      widget_padding: designConfig.layout?.widget_padding,
      widget_margin: designConfig.layout?.widget_margin,

      // Nested configs
      color_scheme: designConfig.colors,
      typography: designConfig.typography,
      header_config: designConfig.components?.header,
      bubble_config: designConfig.components?.bubbles,
      input_config: designConfig.components?.input,
      footer_config: designConfig.components?.footer,
      animation_config: designConfig.advanced,
      responsive_config: designConfig.responsive,

      updated_at: new Date().toISOString(),
    })
    .eq("id", chatbotId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error applying theme:", updateError);
    return { success: false, error: updateError.message };
  }

  // Increment usage count
  await supabase.rpc("increment_theme_usage", { theme_id: themeId });

  revalidatePath(`/chatbot/${chatbotId}/design`);
  return { success: true };
}

/**
 * Delete theme from library
 */
export async function deleteTheme(themeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("design_themes")
    .delete()
    .eq("id", themeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting theme:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/chatbot/[id]/design");
  return { success: true };
}

/**
 * Update theme metadata
 */
export async function updateTheme(
  themeId: string,
  updates: {
    themeName?: string;
    description?: string;
    tags?: string[];
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: any = {};
  if (updates.themeName !== undefined)
    updateData.theme_name = updates.themeName;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.tags !== undefined) updateData.tags = updates.tags;

  const { error } = await supabase
    .from("design_themes")
    .update(updateData)
    .eq("id", themeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating theme:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/chatbot/[id]/design");
  return { success: true };
}

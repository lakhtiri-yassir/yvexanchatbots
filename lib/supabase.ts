// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;
let supabaseAdminClient: any = null;

// Lazy initialize client only when first used
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase environment variables missing. URL: ${
        url ? "OK" : "MISSING"
      }, Key: ${key ? "OK" : "MISSING"}`
    );
  }

  console.log("Initializing Supabase client with URL:", url);
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// Lazy initialize admin client
export function getSupabaseAdmin() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("Supabase admin client not available - missing credentials");
    return null;
  }

  supabaseAdminClient = createClient(url, serviceKey);
  return supabaseAdminClient;
}

// Export as getters for backward compatibility
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  get storage() {
    return getSupabase().storage;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
  rpc(fn: string, args?: any) {
    return getSupabase().rpc(fn, args);
  },
};

export const supabaseAdmin = {
  from(table: string) {
    const admin = getSupabaseAdmin();
    if (!admin) throw new Error("Supabase admin client not initialized");
    return admin.from(table);
  },
};

export type Database = {
  public: {
    Tables: {
      chatbots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          prompt: string;
          owner_name: string;
          bot_avatar_url: string;
          starting_phrase: string;
          openrouter_api_key: string | null;
          model: string;
          voice_enabled: boolean;
          elevenlabs_api_key: string | null;
          voice_id: string | null;
          data_capture_enabled: boolean;
          ui_layout: string;
          ui_theme: string;
          widget_width: string;
          widget_height: string;
          border_radius: string;
          widget_padding: string;
          widget_margin: string;
          color_scheme: any;
          typography: any;
          header_config: any;
          bubble_config: any;
          input_config: any;
          footer_config: any;
          animation_config: any;
          responsive_config: any;
          voice_settings: any;
          last_payment_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          prompt?: string;
          owner_name?: string;
          bot_avatar_url?: string;
          starting_phrase?: string;
          openrouter_api_key?: string | null;
          model?: string;
          voice_enabled?: boolean;
          elevenlabs_api_key?: string | null;
          voice_id?: string | null;
          data_capture_enabled?: boolean;
          ui_layout?: string;
          ui_theme?: string;
          widget_width?: string;
          widget_height?: string;
          border_radius?: string;
          widget_padding?: string;
          widget_margin?: string;
          color_scheme?: any;
          typography?: any;
          header_config?: any;
          bubble_config?: any;
          input_config?: any;
          footer_config?: any;
          animation_config?: any;
          responsive_config?: any;
          voice_settings?: any;
          last_payment_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          prompt?: string;
          owner_name?: string;
          bot_avatar_url?: string;
          starting_phrase?: string;
          openrouter_api_key?: string | null;
          model?: string;
          voice_enabled?: boolean;
          elevenlabs_api_key?: string | null;
          voice_id?: string | null;
          data_capture_enabled?: boolean;
          ui_layout?: string;
          ui_theme?: string;
          widget_width?: string;
          widget_height?: string;
          border_radius?: string;
          widget_padding?: string;
          widget_margin?: string;
          color_scheme?: any;
          typography?: any;
          header_config?: any;
          bubble_config?: any;
          input_config?: any;
          footer_config?: any;
          animation_config?: any;
          responsive_config?: any;
          voice_settings?: any;
          last_payment_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_base_files: {
        Row: {
          id: string;
          chatbot_id: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          file_type: string;
          processed: boolean;
          embeddings_stored: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          file_type: string;
          processed?: boolean;
          embeddings_stored?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          user_id?: string;
          filename?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          processed?: boolean;
          embeddings_stored?: boolean;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          chatbot_id: string;
          session_id: string;
          user_ip: string | null;
          started_at: string;
          last_activity_at: string;
          message_count: number;
          lead_captured: boolean;
          lead_email: string | null;
          lead_name: string | null;
          lead_phone: string | null;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          session_id: string;
          user_ip?: string | null;
          started_at?: string;
          last_activity_at?: string;
          message_count?: number;
          lead_captured?: boolean;
          lead_email?: string | null;
          lead_name?: string | null;
          lead_phone?: string | null;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          session_id?: string;
          user_ip?: string | null;
          started_at?: string;
          last_activity_at?: string;
          message_count?: number;
          lead_captured?: boolean;
          lead_email?: string | null;
          lead_name?: string | null;
          lead_phone?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          chatbot_id: string;
          content: string;
          role: string;
          model_used: string | null;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          chatbot_id: string;
          content: string;
          role: string;
          model_used?: string | null;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          chatbot_id?: string;
          content?: string;
          role?: string;
          model_used?: string | null;
          tokens_used?: number;
          created_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          chatbot_id: string;
          user_id: string;
          tokens_used: number;
          model_used: string;
          cost_estimate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          user_id: string;
          tokens_used?: number;
          model_used: string;
          cost_estimate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          user_id?: string;
          tokens_used?: number;
          model_used?: string;
          cost_estimate?: number;
          created_at?: string;
        };
      };
    };
  };
};

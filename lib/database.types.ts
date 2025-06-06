export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          shared: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopping_items: {
        Row: {
          id: string;
          list_id: string;
          name: string;
          quantity: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          name: string;
          quantity?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          name?: string;
          quantity?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          image_url: string | null;
          cook_time: string;
          servings: number;
          difficulty: string;
          ingredients: Json;
          instructions: Json | null;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          image_url?: string | null;
          cook_time: string;
          servings: number;
          difficulty: string;
          ingredients: Json;
          instructions?: Json | null;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          image_url?: string | null;
          cook_time?: string;
          servings?: number;
          difficulty?: string;
          ingredients?: Json;
          instructions?: Json | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity: number;
          unit: string;
          category: string;
          expiry_date: string | null;
          low_stock: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity: number;
          unit: string;
          category: string;
          expiry_date?: string | null;
          low_stock?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          category?: string;
          expiry_date?: string | null;
          low_stock?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "person" | "pet";
          avatar_type: "default" | "baby" | "child" | "pet" | "custom";
          avatar_url: string | null;
          age: number | null;
          relationship: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "person" | "pet";
          avatar_type: "default" | "baby" | "child" | "pet" | "custom";
          avatar_url?: string | null;
          age?: number | null;
          relationship?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "person" | "pet";
          avatar_type?: "default" | "baby" | "child" | "pet" | "custom";
          avatar_url?: string | null;
          age?: number | null;
          relationship?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      avatar_metadata: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          avatar_type: "default" | "baby" | "child" | "pet" | "custom";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          avatar_type: "default" | "baby" | "child" | "pet" | "custom";
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_path?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          avatar_type?: "default" | "baby" | "child" | "pet" | "custom";
          is_active?: boolean;
          created_at?: string;
        };
      };
      default_avatars: {
        Row: {
          id: string;
          name: string;
          avatar_type: "person" | "baby" | "child" | "pet";
          avatar_url: string;
          seed: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_type: "person" | "baby" | "child" | "pet";
          avatar_url: string;
          seed: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_type?: "person" | "baby" | "child" | "pet";
          avatar_url?: string;
          seed?: string;
          created_at?: string;
        };
      };
      users_metadata: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          created_at: string;
          registration_source: string;
          onboarding_status: boolean;
          preferences_json: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          created_at?: string;
          registration_source: string;
          onboarding_status?: boolean;
          preferences_json?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          created_at?: string;
          registration_source?: string;
          onboarding_status?: boolean;
          preferences_json?: Json;
          updated_at?: string;
        };
      };
      loyalty_cards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          card_number: string;
          image_url: string | null;
          barcode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          card_number: string;
          image_url?: string | null;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          card_number?: string;
          image_url?: string | null;
          barcode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_hero_content: {
        Row: {
          id: string;
          date: string;
          hero_image_url: string;
          header_text: string;
          subtext: string;
          action_button_text: string | null;
          action_button_data: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          hero_image_url: string;
          header_text: string;
          subtext: string;
          action_button_text?: string | null;
          action_button_data?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          hero_image_url?: string;
          header_text?: string;
          subtext?: string;
          action_button_text?: string | null;
          action_button_data?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_behavior_logs: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          action_data: Json | null;
          frequency_count: number;
          last_performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          action_data?: Json | null;
          frequency_count?: number;
          last_performed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          action_data?: Json | null;
          frequency_count?: number;
          last_performed_at?: string;
          created_at?: string;
        };
      };
      assistant_categories: {
        Row: {
          id: string;
          user_id: string;
          category_name: string;
          category_icon: string;
          action_type: string;
          action_data: Json | null;
          display_order: number;
          is_personalized: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_name: string;
          category_icon: string;
          action_type: string;
          action_data?: Json | null;
          display_order?: number;
          is_personalized?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_name?: string;
          category_icon?: string;
          action_type?: string;
          action_data?: Json | null;
          display_order?: number;
          is_personalized?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_suggestions: {
        Row: {
          id: string;
          user_id: string;
          product_name: string;
          category: string;
          category_icon: string | null;
          category_color: string | null;
          image_url: string | null;
          suggested_list_id: string | null;
          prediction_score: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_name: string;
          category: string;
          category_icon?: string | null;
          category_color?: string | null;
          image_url?: string | null;
          suggested_list_id?: string | null;
          prediction_score?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_name?: string;
          category?: string;
          category_icon?: string | null;
          category_color?: string | null;
          image_url?: string | null;
          suggested_list_id?: string | null;
          prediction_score?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

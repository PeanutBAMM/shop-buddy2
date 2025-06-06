export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assistant_categories: {
        Row: {
          action_data: Json | null
          action_type: string
          category_icon: string
          category_name: string
          created_at: string | null
          display_order: number | null
          id: string
          is_personalized: boolean | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          category_icon: string
          category_name: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_personalized?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          category_icon?: string
          category_name?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_personalized?: boolean | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_metadata: {
        Row: {
          avatar_type: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          user_id: string | null
        }
        Insert: {
          avatar_type: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_type?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_hero_content: {
        Row: {
          action_button_data: Json | null
          action_button_text: string | null
          created_at: string | null
          date: string
          header_text: string
          hero_image_url: string
          id: string
          is_active: boolean | null
          subtext: string
          updated_at: string | null
        }
        Insert: {
          action_button_data?: Json | null
          action_button_text?: string | null
          created_at?: string | null
          date: string
          header_text: string
          hero_image_url: string
          id?: string
          is_active?: boolean | null
          subtext: string
          updated_at?: string | null
        }
        Update: {
          action_button_data?: Json | null
          action_button_text?: string | null
          created_at?: string | null
          date?: string
          header_text?: string
          hero_image_url?: string
          id?: string
          is_active?: boolean | null
          subtext?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      default_avatars: {
        Row: {
          avatar_type: string
          avatar_url: string
          created_at: string | null
          id: string
          name: string
          seed: string
        }
        Insert: {
          avatar_type: string
          avatar_url: string
          created_at?: string | null
          id?: string
          name: string
          seed: string
        }
        Update: {
          avatar_type?: string
          avatar_url?: string
          created_at?: string | null
          id?: string
          name?: string
          seed?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          age: number | null
          allergies: Json | null
          avatar_type: string
          avatar_url: string | null
          created_at: string | null
          dietary_preferences: Json | null
          id: string
          name: string
          relationship: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age?: number | null
          allergies?: Json | null
          avatar_type: string
          avatar_url?: string | null
          created_at?: string | null
          dietary_preferences?: Json | null
          id?: string
          name: string
          relationship?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age?: number | null
          allergies?: Json | null
          avatar_type?: string
          avatar_url?: string | null
          created_at?: string | null
          dietary_preferences?: Json | null
          id?: string
          name?: string
          relationship?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          created_at: string | null
          expiry_date: string | null
          id: string
          low_stock: boolean | null
          name: string
          quantity: number
          unit: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          low_stock?: boolean | null
          name: string
          quantity?: number
          unit: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          low_stock?: boolean | null
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_cards: {
        Row: {
          barcode: string | null
          card_number: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          card_number: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          card_number?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suggestions: {
        Row: {
          category: string
          category_color: string | null
          category_icon: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          prediction_score: number | null
          product_name: string
          suggested_list_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          category_color?: string | null
          category_icon?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          prediction_score?: number | null
          product_name: string
          suggested_list_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          category_color?: string | null
          category_icon?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          prediction_score?: number | null
          product_name?: string
          suggested_list_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_suggestions_suggested_list_id_fkey"
            columns: ["suggested_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string
          cook_time: string
          created_at: string | null
          difficulty: string
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json | null
          name: string
          servings: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          cook_time: string
          created_at?: string | null
          difficulty: string
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions?: Json | null
          name: string
          servings: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          cook_time?: string
          created_at?: string | null
          difficulty?: string
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json | null
          name?: string
          servings?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          list_id: string | null
          name: string
          quantity: string | null
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          list_id?: string | null
          name: string
          quantity?: string | null
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          list_id?: string | null
          name?: string
          quantity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          shared: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          shared?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          shared?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_logs: {
        Row: {
          action_data: Json | null
          action_type: string
          created_at: string | null
          frequency_count: number | null
          id: string
          last_performed_at: string | null
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          last_performed_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          last_performed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_behavior_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_type: string
          preference_value: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_type: string
          preference_value: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_type?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users_metadata: {
        Row: {
          created_at: string | null
          email: string
          id: string
          onboarding_status: boolean | null
          registration_source: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          onboarding_status?: boolean | null
          registration_source: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          onboarding_status?: boolean | null
          registration_source?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

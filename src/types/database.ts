export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      content_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          content_id: string
          created_at: string
          engagement_rate: number | null
          engagements: number | null
          id: string
          impressions: number | null
          likes: number | null
          platform: string
          shares: number | null
          synced_at: string
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          content_id: string
          created_at?: string
          engagement_rate?: number | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform: string
          shares?: number | null
          synced_at?: string
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          content_id?: string
          created_at?: string
          engagement_rate?: number | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform?: string
          shares?: number | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_schedule: {
        Row: {
          content_id: string
          created_at: string
          error_message: string | null
          failed: boolean | null
          id: string
          is_published: boolean | null
          published_at: string | null
          scheduled_for: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          error_message?: string | null
          failed?: boolean | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          scheduled_for: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          error_message?: string | null
          failed?: boolean | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          scheduled_for?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_schedule_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_schedule_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          ai_model: string
          article_id: string | null
          content_type: string
          created_at: string
          generated_hashtags: string[] | null
          generated_text: string
          generation_time_ms: number | null
          id: string
          image_url: string | null
          is_published: boolean | null
          platform: string
          published_at: string | null
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model: string
          article_id?: string | null
          content_type: string
          created_at?: string
          generated_hashtags?: string[] | null
          generated_text: string
          generation_time_ms?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          platform: string
          published_at?: string | null
          tone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string
          article_id?: string | null
          content_type?: string
          created_at?: string
          generated_hashtags?: string[] | null
          generated_text?: string
          generation_time_ms?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          platform?: string
          published_at?: string | null
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          category: string[] | null
          content: string | null
          created_at: string
          description: string | null
          fetched_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          keywords: string[] | null
          published_at: string
          relevance_score: number | null
          sentiment: string | null
          source: string
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string
          description?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          published_at: string
          relevance_score?: number | null
          sentiment?: string | null
          source: string
          title: string
          url: string
        }
        Update: {
          author?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string
          description?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          published_at?: string
          relevance_score?: number | null
          sentiment?: string | null
          source?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_news: {
        Row: {
          article_id: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_news_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_news_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_integrations: {
        Row: {
          access_token: string | null
          connected_at: string | null
          created_at: string
          id: string
          is_connected: boolean | null
          last_used_at: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          content_tone: string | null
          created_at: string
          id: string
          notification_breaking_news: boolean | null
          notification_email: boolean | null
          notification_push: boolean | null
          notification_weekly_digest: boolean | null
          preferred_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_tone?: string | null
          created_at?: string
          id?: string
          notification_breaking_news?: boolean | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          notification_weekly_digest?: boolean | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_tone?: string | null
          created_at?: string
          id?: string
          notification_breaking_news?: boolean | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          notification_weekly_digest?: boolean | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

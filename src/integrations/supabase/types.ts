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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chat_platforms: {
        Row: {
          api_key: string | null
          created_at: string
          id: string
          is_active: boolean
          name: Database["public"]["Enums"]["chat_platform"]
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: Database["public"]["Enums"]["chat_platform"]
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: Database["public"]["Enums"]["chat_platform"]
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          display_name: string | null
          email_address: string
          id: string
          imap_host: string | null
          imap_port: number | null
          imap_secure: boolean | null
          is_active: boolean | null
          last_sync_at: string | null
          password_encrypted: string | null
          provider: Database["public"]["Enums"]["email_provider"]
          refresh_token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          email_address: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          is_active?: boolean | null
          last_sync_at?: string | null
          password_encrypted?: string | null
          provider: Database["public"]["Enums"]["email_provider"]
          refresh_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          email_address?: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          is_active?: boolean | null
          last_sync_at?: string | null
          password_encrypted?: string | null
          provider?: Database["public"]["Enums"]["email_provider"]
          refresh_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_folders: {
        Row: {
          account_id: string
          created_at: string
          folder_name: string
          folder_path: string
          id: string
          message_count: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          folder_name: string
          folder_path: string
          id?: string
          message_count?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          folder_name?: string
          folder_path?: string
          id?: string
          message_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_folders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_suggested_replies: {
        Row: {
          confidence_score: number | null
          context_used: string | null
          created_at: string
          email_id: string
          id: string
          is_used: boolean | null
          suggested_reply: string
        }
        Insert: {
          confidence_score?: number | null
          context_used?: string | null
          created_at?: string
          email_id: string
          id?: string
          is_used?: boolean | null
          suggested_reply: string
        }
        Update: {
          confidence_score?: number | null
          context_used?: string | null
          created_at?: string
          email_id?: string
          id?: string
          is_used?: boolean | null
          suggested_reply?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_suggested_replies_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sync_jobs: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          emails_processed: number | null
          error_message: string | null
          id: string
          last_message_date: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          emails_processed?: number | null
          error_message?: string | null
          id?: string
          last_message_date?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          emails_processed?: number | null
          error_message?: string | null
          id?: string
          last_message_date?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_jobs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          account_id: string
          ai_confidence: number | null
          bcc_emails: string[] | null
          category: Database["public"]["Enums"]["email_category"] | null
          cc_emails: string[] | null
          created_at: string
          email_body: string | null
          email_body_html: string | null
          email_body_plain: string | null
          folder_id: string | null
          from_email: string
          from_name: string | null
          has_attachments: boolean | null
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          message_id: string
          priority_score: number | null
          received_at: string
          reply_to: string | null
          search_vector: unknown | null
          sent_at: string | null
          sentiment_score: number | null
          subject: string | null
          to_emails: string[] | null
          updated_at: string
        }
        Insert: {
          account_id: string
          ai_confidence?: number | null
          bcc_emails?: string[] | null
          category?: Database["public"]["Enums"]["email_category"] | null
          cc_emails?: string[] | null
          created_at?: string
          email_body?: string | null
          email_body_html?: string | null
          email_body_plain?: string | null
          folder_id?: string | null
          from_email: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_id: string
          priority_score?: number | null
          received_at: string
          reply_to?: string | null
          search_vector?: unknown | null
          sent_at?: string | null
          sentiment_score?: number | null
          subject?: string | null
          to_emails?: string[] | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          ai_confidence?: number | null
          bcc_emails?: string[] | null
          category?: Database["public"]["Enums"]["email_category"] | null
          cc_emails?: string[] | null
          created_at?: string
          email_body?: string | null
          email_body_html?: string | null
          email_body_plain?: string | null
          folder_id?: string | null
          from_email?: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_id?: string
          priority_score?: number | null
          received_at?: string
          reply_to?: string | null
          search_vector?: unknown | null
          sent_at?: string | null
          sentiment_score?: number | null
          subject?: string | null
          to_emails?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "email_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base_emails: {
        Row: {
          category: string | null
          content: string
          created_at: string
          embedding_summary: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          embedding_summary?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          embedding_summary?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          ai_confidence: number | null
          category: Database["public"]["Enums"]["message_category"] | null
          content: string
          created_at: string
          id: string
          is_urgent: boolean | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["chat_platform"]
          platform_message_id: string
          sender_id: string
          sender_name: string | null
          sentiment_score: number | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          category?: Database["public"]["Enums"]["message_category"] | null
          content: string
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["chat_platform"]
          platform_message_id: string
          sender_id: string
          sender_name?: string | null
          sentiment_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          category?: Database["public"]["Enums"]["message_category"] | null
          content?: string
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["chat_platform"]
          platform_message_id?: string
          sender_id?: string
          sender_name?: string | null
          sentiment_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      suggested_replies: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_used: boolean | null
          message_id: string
          suggested_text: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          message_id: string
          suggested_text: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          message_id?: string
          suggested_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggested_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      chat_platform: "whatsapp" | "telegram" | "slack" | "discord"
      email_category:
        | "interested"
        | "meeting_booked"
        | "not_interested"
        | "spam"
        | "out_of_office"
        | "support"
        | "sales_lead"
      email_provider: "gmail" | "outlook" | "yahoo" | "imap" | "exchange"
      message_category:
        | "support_request"
        | "sales_lead"
        | "general_query"
        | "spam"
        | "urgent"
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
    Enums: {
      chat_platform: ["whatsapp", "telegram", "slack", "discord"],
      email_category: [
        "interested",
        "meeting_booked",
        "not_interested",
        "spam",
        "out_of_office",
        "support",
        "sales_lead",
      ],
      email_provider: ["gmail", "outlook", "yahoo", "imap", "exchange"],
      message_category: [
        "support_request",
        "sales_lead",
        "general_query",
        "spam",
        "urgent",
      ],
    },
  },
} as const

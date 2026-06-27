export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coping_preferences: {
        Row: {
          effectiveness_score: number | null
          exercise_id: string
          id: string
          updated_at: string
          use_count: number | null
          user_id: string
        }
        Insert: {
          effectiveness_score?: number | null
          exercise_id: string
          id?: string
          updated_at?: string
          use_count?: number | null
          user_id: string
        }
        Update: {
          effectiveness_score?: number | null
          exercise_id?: string
          id?: string
          updated_at?: string
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coping_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_events: {
        Row: {
          created_at: string
          id: string
          severity: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          severity: string
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          severity?: string
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crisis_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_completions: {
        Row: {
          created_at: string
          exercise_id: string
          helpful_rating: number | null
          id: string
          trigger_context: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          helpful_rating?: number | null
          id?: string
          trigger_context?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          helpful_rating?: number | null
          id?: string
          trigger_context?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_reflection: string | null
          content: string
          created_at: string
          id: string
          invitation_question: string | null
          micro_step: string | null
          sentiment_signals: Json | null
          themes: string[] | null
          user_id: string
        }
        Insert: {
          ai_reflection?: string | null
          content: string
          created_at?: string
          id?: string
          invitation_question?: string | null
          micro_step?: string | null
          sentiment_signals?: Json | null
          themes?: string[] | null
          user_id: string
        }
        Update: {
          ai_reflection?: string | null
          content?: string
          created_at?: string
          id?: string
          invitation_question?: string | null
          micro_step?: string | null
          sentiment_signals?: Json | null
          themes?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          created_at: string
          id: string
          mood: Database["public"]["Enums"]["mood_type"]
          note: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: Database["public"]["Enums"]["mood_type"]
          note?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"]
          note?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          days_to_exam: number | null
          display_name: string
          exam_type: Database["public"]["Enums"]["exam_type"] | null
          exam_year: number | null
          id: string
          language_pref: Database["public"]["Enums"]["language_pref"] | null
          nudge_enabled: boolean
          onboarding_complete: boolean
          trust_level: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_to_exam?: number | null
          display_name?: string
          exam_type?: Database["public"]["Enums"]["exam_type"] | null
          exam_year?: number | null
          id: string
          language_pref?: Database["public"]["Enums"]["language_pref"] | null
          nudge_enabled?: boolean
          onboarding_complete?: boolean
          trust_level?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_to_exam?: number | null
          display_name?: string
          exam_type?: Database["public"]["Enums"]["exam_type"] | null
          exam_year?: number | null
          id?: string
          language_pref?: Database["public"]["Enums"]["language_pref"] | null
          nudge_enabled?: boolean
          onboarding_complete?: boolean
          trust_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          created_at: string
          evidence_quotes: Json | null
          id: string
          invitation_question: string | null
          patterns: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          evidence_quotes?: Json | null
          id?: string
          invitation_question?: string | null
          patterns?: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          evidence_quotes?: Json | null
          id?: string
          invitation_question?: string | null
          patterns?: Json | null
          summary?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      exam_type:
        | "NEET"
        | "JEE"
        | "CUET"
        | "CAT"
        | "GATE"
        | "UPSC"
        | "BOARDS"
        | "OTHER"
      language_pref: "en" | "hi" | "hinglish"
      mood_type:
        | "happy"
        | "calm"
        | "anxious"
        | "angry"
        | "sad"
        | "tired"
        | "overwhelmed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

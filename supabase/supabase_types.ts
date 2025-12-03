export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon_url: string | null
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          category: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon_url?: string | null
          id: string
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          challenge: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_types: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          exercise: string
          id: string
          title: string | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          exercise: string
          id?: string
          title?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          exercise?: string
          id?: string
          title?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          goal: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          goal: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          goal?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      passages: {
        Row: {
          created_at: string | null
          id: string
          passage: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          passage?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          passage?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      paystack_payloads: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          comprehension: number
          correct_answers: number | null
          created_at: string | null
          duration: number | null
          elapsed_time: number | null
          exercise_id: string | null
          id: string
          passage_id: string | null
          start_time: number | null
          total_questions: number | null
          total_words: number | null
          updated_at: string | null
          user_id: string | null
          wpm: number
        }
        Insert: {
          comprehension: number
          correct_answers?: number | null
          created_at?: string | null
          duration?: number | null
          elapsed_time?: number | null
          exercise_id?: string | null
          id?: string
          passage_id?: string | null
          start_time?: number | null
          total_questions?: number | null
          total_words?: number | null
          updated_at?: string | null
          user_id?: string | null
          wpm: number
        }
        Update: {
          comprehension?: number
          correct_answers?: number | null
          created_at?: string | null
          duration?: number | null
          elapsed_time?: number | null
          exercise_id?: string | null
          id?: string
          passage_id?: string | null
          start_time?: number | null
          total_questions?: number | null
          total_words?: number | null
          updated_at?: string | null
          user_id?: string | null
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          created_at: string
          description: string
          expires_at: string | null
          id: string
          target_metric: string
          target_value: number
          type: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          target_metric: string
          target_value: number
          type: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          target_metric?: string
          target_value?: number
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          font_face: string
          font_size_scale: number
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          font_face?: string
          font_size_scale?: number
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          font_face?: string
          font_size_scale?: number
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          claimed_at: string | null
          current_value: number
          is_completed: boolean
          quest_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          current_value?: number
          is_completed?: boolean
          quest_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          current_value?: number
          is_completed?: boolean
          quest_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_time_seconds: number
          total_words_read: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_time_seconds?: number
          total_words_read?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_time_seconds?: number
          total_words_read?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          achievements: string | null
          badges: string | null
          baseline_comprehension: number | null
          baseline_wpm: number | null
          challenges: string | null
          content_type: string | null
          created_at: string | null
          current_comprehension_score: number | null
          current_wpm: number | null
          daily_reminder: boolean | null
          date_of_birth: string | null
          display_settings: Json | null
          email: string
          focus_score: number | null
          goals: string | null
          id: string
          is_subscribed: boolean | null
          last_active_date: string | null
          level: number | null
          name: string
          onboarding_completed: boolean | null
          reminder_time: string | null
          streak_days: number | null
          total_sessions: number | null
          total_time_spent: number | null
          updated_at: string | null
          weekly_summary: boolean | null
          xp_earned: number | null
        }
        Insert: {
          achievements?: string | null
          badges?: string | null
          baseline_comprehension?: number | null
          baseline_wpm?: number | null
          challenges?: string | null
          content_type?: string | null
          created_at?: string | null
          current_comprehension_score?: number | null
          current_wpm?: number | null
          daily_reminder?: boolean | null
          date_of_birth?: string | null
          display_settings?: Json | null
          email: string
          focus_score?: number | null
          goals?: string | null
          id: string
          is_subscribed?: boolean | null
          last_active_date?: string | null
          level?: number | null
          name: string
          onboarding_completed?: boolean | null
          reminder_time?: string | null
          streak_days?: number | null
          total_sessions?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          weekly_summary?: boolean | null
          xp_earned?: number | null
        }
        Update: {
          achievements?: string | null
          badges?: string | null
          baseline_comprehension?: number | null
          baseline_wpm?: number | null
          challenges?: string | null
          content_type?: string | null
          created_at?: string | null
          current_comprehension_score?: number | null
          current_wpm?: number | null
          daily_reminder?: boolean | null
          date_of_birth?: string | null
          display_settings?: Json | null
          email?: string
          focus_score?: number | null
          goals?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_active_date?: string | null
          level?: number | null
          name?: string
          onboarding_completed?: boolean | null
          reminder_time?: string | null
          streak_days?: number | null
          total_sessions?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          weekly_summary?: boolean | null
          xp_earned?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: { Args: { total_xp: number }; Returns: number }
      calculate_session_xp: {
        Args: {
          comprehension_pct: number
          duration_seconds: number
          words_read: number
        }
        Returns: number
      }
      check_and_unlock_achievements: {
        Args: { uid: string }
        Returns: {
          achievement_id: string
          just_unlocked: boolean
        }[]
      }
      get_words_read_today: { Args: { uid: string }; Returns: number }
      update_avg_scores: { Args: { uid: string }; Returns: Json }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


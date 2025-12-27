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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          playcoins_reward: number
          rarity: string
          requirement_metadata: Json | null
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          playcoins_reward?: number
          rarity?: string
          requirement_metadata?: Json | null
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          playcoins_reward?: number
          rarity?: string
          requirement_metadata?: Json | null
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          is_active: boolean
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string
          grade: string
          id: string
          is_active: boolean
          name: string
          section: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          grade: string
          id?: string
          is_active?: boolean
          name: string
          section?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          grade?: string
          id?: string
          is_active?: boolean
          name?: string
          section?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          playcoins_reward: number
          requirement_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          playcoins_reward?: number
          requirement_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          playcoins_reward?: number
          requirement_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number
          estimated_duration_minutes: number
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          order_index: number
          playcoins_reward: number
          prerequisites: Json | null
          slug: string
          subject_id: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_duration_minutes?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          order_index?: number
          playcoins_reward?: number
          prerequisites?: Json | null
          slug: string
          subject_id: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number
          estimated_duration_minutes?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          playcoins_reward?: number
          prerequisites?: Json | null
          slug?: string
          subject_id?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_child_links: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_verified: boolean
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_verified?: boolean
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          parent_id?: string
        }
        Relationships: []
      }
      playcoins_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string
          id: string
          source_id: string | null
          source_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description: string
          id?: string
          source_id?: string | null
          source_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string
          id?: string
          source_id?: string | null
          source_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      playcoins_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          grade: string | null
          id: string
          phone: string | null
          school: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          grade?: string | null
          id: string
          phone?: string | null
          school?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          grade?: string | null
          id?: string
          phone?: string | null
          school?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          content_index: number
          created_at: string
          id: string
          is_completed: boolean
          last_read_at: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          content_index?: number
          created_at?: string
          id?: string
          is_completed?: boolean
          last_read_at?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          content_index?: number
          created_at?: string
          id?: string
          is_completed?: boolean
          last_read_at?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          delivery_address: string | null
          id: string
          notes: string | null
          playcoins_spent: number
          reward_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          playcoins_spent: number
          reward_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          playcoins_spent?: number
          reward_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          playcoins_cost: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          playcoins_cost: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          playcoins_cost?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          created_at: string
          id: string
          photo_url: string | null
          playcoins_awarded: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_feedback: string | null
          status: string
          submitted_at: string
          task_id: string
          text_explanation: string | null
          updated_at: string
          user_id: string
          voice_url: string | null
          xp_awarded: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url?: string | null
          playcoins_awarded?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_feedback?: string | null
          status?: string
          submitted_at?: string
          task_id: string
          text_explanation?: string | null
          updated_at?: string
          user_id: string
          voice_url?: string | null
          xp_awarded?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string | null
          playcoins_awarded?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_feedback?: string | null
          status?: string
          submitted_at?: string
          task_id?: string
          text_explanation?: string | null
          updated_at?: string
          user_id?: string
          voice_url?: string | null
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty_level: number
          id: string
          instructions: string | null
          is_active: boolean
          is_recurring: boolean
          playcoins_reward: number
          recurrence_days: number | null
          requires_photo: boolean
          requires_voice: boolean
          subject_id: string | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_recurring?: boolean
          playcoins_reward?: number
          recurrence_days?: number | null
          requires_photo?: boolean
          requires_voice?: boolean
          subject_id?: string | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_recurring?: boolean
          playcoins_reward?: number
          recurrence_days?: number | null
          requires_photo?: boolean
          requires_voice?: boolean
          subject_id?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          claimed_at: string | null
          id: string
          is_claimed: boolean
          progress: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean
          progress?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          claimed_at?: string | null
          id?: string
          is_claimed?: boolean
          progress?: number
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
      user_daily_challenges: {
        Row: {
          challenge_date: string
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          is_claimed: boolean
          is_completed: boolean
          progress: number
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          progress?: number
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_game_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          completion_percentage: number
          created_at: string
          game_id: string
          game_state: Json | null
          id: string
          is_completed: boolean
          last_played_at: string
          max_score: number
          score: number
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          game_id: string
          game_state?: Json | null
          id?: string
          is_completed?: boolean
          last_played_at?: string
          max_score?: number
          score?: number
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          game_id?: string
          game_state?: Json | null
          id?: string
          is_completed?: boolean
          last_played_at?: string
          max_score?: number
          score?: number
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number
          current_xp: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
          xp_to_next_level?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_weekly_challenges: {
        Row: {
          challenge_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          is_claimed: boolean
          is_completed: boolean
          progress: number
          user_id: string
          week_start_date: string
        }
        Insert: {
          challenge_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          progress?: number
          user_id: string
          week_start_date: string
        }
        Update: {
          challenge_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          is_completed?: boolean
          progress?: number
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_weekly_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          created_at: string
          district: string | null
          id: string
          name: string
          state: string | null
          total_playcoins_earned: number
          total_students: number
          total_tasks_completed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          name: string
          state?: string | null
          total_playcoins_earned?: number
          total_students?: number
          total_tasks_completed?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          name?: string
          state?: string | null
          total_playcoins_earned?: number
          total_students?: number
          total_tasks_completed?: number
          updated_at?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          playcoins_reward: number
          requirement_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          playcoins_reward?: number
          requirement_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          playcoins_reward?: number
          requirement_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          id: string
          student_id: string
          product_id: string
          product_name: string
          redemption_code: string
          one_time_token: string
          coins_redeemed: number
          qr_data: Json
          status: string
          verified_by: string | null
          verified_at: string | null
          rejected_reason: string | null
          created_at: string
          expires_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          product_id: string
          product_name: string
          redemption_code: string
          one_time_token: string
          coins_redeemed: number
          qr_data: Json
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          rejected_reason?: string | null
          created_at?: string
          expires_at: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          product_id?: string
          product_name?: string
          redemption_code?: string
          one_time_token?: string
          coins_redeemed?: number
          qr_data?: Json
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          rejected_reason?: string | null
          created_at?: string
          expires_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "parent"
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
      app_role: ["student", "teacher", "parent"],
    },
  },
} as const

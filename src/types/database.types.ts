export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          category: string
          code: string
          created_at: string
          icon: string
          id: string
          points_value: number
          rarity: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          icon: string
          id?: string
          points_value?: number
          rarity: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          icon?: string
          id?: string
          points_value?: number
          rarity?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "course_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      course_terms: {
        Row: {
          course_id: string
          created_at: string
          end_date: string | null
          id: string
          max_students: number | null
          name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          max_students?: number | null
          name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          max_students?: number | null
          name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_terms_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          instructor_id: string
          max_students: number | null
          name: string
          preview_data: Json | null
          price: number
          slug: string
          start_date: string | null
          status: string
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id: string
          max_students?: number | null
          name: string
          preview_data?: Json | null
          price?: number
          slug: string
          start_date?: string | null
          status?: string
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string
          max_students?: number | null
          name?: string
          preview_data?: Json | null
          price?: number
          slug?: string
          start_date?: string | null
          status?: string
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_categories: {
        Row: {
          course_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_categories_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_submissions: {
        Row: {
          course_id: string | null
          exercise_id: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          latest_answer: string
          score: number | null
          solution: string
          student_id: string
          submission_status: string
          submitted_at: string
        }
        Insert: {
          course_id?: string | null
          exercise_id: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          latest_answer?: string
          score?: number | null
          solution: string
          student_id: string
          submission_status?: string
          submitted_at?: string
        }
        Update: {
          course_id?: string | null
          exercise_id?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          latest_answer?: string
          score?: number | null
          solution?: string
          student_id?: string
          submission_status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_submissions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_submissions_conversation: {
        Row: {
          created_at: string
          id: number
          message: string
          meta_data: Json | null
          sender_id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          meta_data?: Json | null
          sender_id: string
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          meta_data?: Json | null
          sender_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_submissions_conversation_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_submissions_conversation_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "exercise_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          auto_grade: boolean | null
          category_id: string | null
          content_url: string | null
          course_id: string
          created_at: string
          created_by: string
          days_to_close: number
          days_to_due: number
          days_to_open: number
          description: string | null
          difficulty: string
          estimated_time: string
          exercise_type: string
          form_structure: Json | null
          id: string
          metadata: Json | null
          points: number
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          auto_grade?: boolean | null
          category_id?: string | null
          content_url?: string | null
          course_id: string
          created_at?: string
          created_by: string
          days_to_close: number
          days_to_due: number
          days_to_open: number
          description?: string | null
          difficulty: string
          estimated_time?: string
          exercise_type?: string
          form_structure?: Json | null
          id?: string
          metadata?: Json | null
          points?: number
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          auto_grade?: boolean | null
          category_id?: string | null
          content_url?: string | null
          course_id?: string
          created_at?: string
          created_by?: string
          days_to_close?: number
          days_to_due?: number
          days_to_open?: number
          description?: string | null
          difficulty?: string
          estimated_time?: string
          exercise_type?: string
          form_structure?: Json | null
          id?: string
          metadata?: Json | null
          points?: number
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      group_courses: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          course_id: string | null
          group_id: string | null
          id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          course_id?: string | null
          group_id?: string | null
          id?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          course_id?: string | null
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_courses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          telegram_channels: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          telegram_channels?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          telegram_channels?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          priority: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_familiarity: string | null
          birthday: string | null
          city: string | null
          class_id: string | null
          class_name: string | null
          country: string | null
          created_at: string | null
          education: string | null
          email: string | null
          english_level: string | null
          first_name: string
          gender: string | null
          id: string
          is_demo: boolean
          job: string | null
          language_preference: string | null
          last_name: string
          license: Json | null
          phone_number: string | null
          role: string | null
          telegram_id: string | null
          updated_at: string | null
          whatsapp_id: string | null
        }
        Insert: {
          ai_familiarity?: string | null
          birthday?: string | null
          city?: string | null
          class_id?: string | null
          class_name?: string | null
          country?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          english_level?: string | null
          first_name: string
          gender?: string | null
          id: string
          is_demo?: boolean
          job?: string | null
          language_preference?: string | null
          last_name: string
          license?: Json | null
          phone_number?: string | null
          role?: string | null
          telegram_id?: string | null
          updated_at?: string | null
          whatsapp_id?: string | null
        }
        Update: {
          ai_familiarity?: string | null
          birthday?: string | null
          city?: string | null
          class_id?: string | null
          class_name?: string | null
          country?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          english_level?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_demo?: boolean
          job?: string | null
          language_preference?: string | null
          last_name?: string
          license?: Json | null
          phone_number?: string | null
          role?: string | null
          telegram_id?: string | null
          updated_at?: string | null
          whatsapp_id?: string | null
        }
        Relationships: []
      }



      student_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          points_earned: number | null
          session_id: string | null
          student_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          points_earned?: number | null
          session_id?: string | null
          student_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          points_earned?: number | null
          session_id?: string | null
          student_id?: string
        }
        Relationships: []
      }
      student_awards: {
        Row: {
          award_id: string
          bonus_points: number
          earned_at: string
          id: string
          student_id: string
        }
        Insert: {
          award_id: string
          bonus_points?: number
          earned_at?: string
          id?: string
          student_id: string
        }
        Update: {
          award_id?: string
          bonus_points?: number
          earned_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean
          task_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean
          task_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean
          task_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          instruction: string | null
          is_completed: boolean
          priority: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instruction?: string | null
          is_completed?: boolean
          priority?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instruction?: string | null
          is_completed?: boolean
          priority?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_course_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          course_id: string
          id: string
          teacher_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          course_id: string
          id?: string
          teacher_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          course_id?: string
          id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_course_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_term_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          teacher_id: string
          term_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          teacher_id: string
          term_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          teacher_id?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_term_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_term_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_term_assignments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "course_terms"
            referencedColumns: ["id"]
          },
        ]
      }

    }
    Views: {
      student_achievements_view: {
        Row: {
          award_code: string | null
          award_id: string | null
          bonus_points: number | null
          category: string | null
          earned_at: string | null
          icon: string | null
          id: string | null
          points_value: number | null
          rarity: string | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_student_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_and_award_achievements: {
        Args: { student_id_param: string }
        Returns: undefined
      }
      check_profile_access: {
        Args: { profile_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_latest_notifications: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          id: string
          title: string
          description: string
          type: Database["public"]["Enums"]["notification_type"]
          created_at: string
          is_read: boolean
          link: string
          metadata: Json
          sender_id: string
        }[]
      }
      get_unread_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_balance: {
        Args: { user_id: string }
        Returns: number
      }
      is_student_enrolled_in_course: {
        Args: { course_id: string; student_id: string }
        Returns: boolean
      }
      is_trainer_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_student_activity: {
        Args:
          | {
              p_student_id: string
              p_activity_type: string
              p_activity_data?: Json
              p_points_earned?: number
              p_session_id?: string
              p_duration_minutes?: number
            }
          | {
              p_student_id: string
              p_activity_type: string
              p_description?: string
              p_metadata?: Json
            }
        Returns: string
      }
      mark_notification_as_read: {
        Args: { notification_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      notification_type: "exercise_feedback" | "award_achieved" | "system"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "waiting"
      payment_type:
        | "buy_course"
        | "discount"
        | "pay_money"
        | "refund"
        | "installment"
    }
    CompositeTypes: {
      course_enrollment: {
        id: string | null
        course_id: string | null
        student_id: string | null
        first_name: string | null
        last_name: string | null
        student_email: string | null
        status: string | null
        enrolled_at: string | null
        term_id: string | null
        created_at: string | null
        updated_at: string | null
      }
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
      notification_type: ["exercise_feedback", "award_achieved", "system"],
      payment_status: ["pending", "completed", "failed", "refunded", "waiting"],
      payment_type: [
        "buy_course",
        "discount",
        "pay_money",
        "refund",
        "installment",
      ],
    },
  },
} as const

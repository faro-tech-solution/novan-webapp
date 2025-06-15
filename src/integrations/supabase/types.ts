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
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          status: string
          student_email: string
          student_id: string
          student_name: string
          term_id: string | null
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          status?: string
          student_email: string
          student_id: string
          student_name: string
          term_id?: string | null
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_email?: string
          student_id?: string
          student_name?: string
          term_id?: string | null
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
          instructor_name: string
          max_students: number | null
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id: string
          instructor_name: string
          max_students?: number | null
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string
          instructor_name?: string
          max_students?: number | null
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_submissions: {
        Row: {
          exercise_id: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          solution: string
          student_email: string
          student_id: string
          student_name: string
          submitted_at: string
        }
        Insert: {
          exercise_id: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          solution: string
          student_email: string
          student_id: string
          student_name: string
          submitted_at?: string
        }
        Update: {
          exercise_id?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          solution?: string
          student_email?: string
          student_id?: string
          student_name?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_submissions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          close_date: string
          course_name: string
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          due_date: string
          estimated_time: string
          id: string
          open_date: string
          points: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          close_date: string
          course_name: string
          created_at?: string
          created_by: string
          description?: string | null
          difficulty: string
          due_date: string
          estimated_time: string
          id?: string
          open_date: string
          points?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          close_date?: string
          course_name?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          due_date?: string
          estimated_time?: string
          id?: string
          open_date?: string
          points?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_id: string | null
          class_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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

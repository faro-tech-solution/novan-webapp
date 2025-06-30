import { PaymentStatus, PaymentType } from "@/types/accounting"

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
      awards: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_value: number
          rarity: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points_value?: number
          rarity: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_value?: number
          rarity?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
          term_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
          term_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
          term_id?: string | null
          created_at?: string
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
            foreignKeyName: "course_enrollments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "course_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
          id: string
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
          price: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          price?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
          price?: number
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
          student_id: string
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
          student_id: string
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
          student_id?: string
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
          course_id: string
          created_at: string
          created_by: string
          days_to_close: number
          days_to_due: number
          days_to_open: number
          description: string | null
          difficulty: string
          estimated_time: string
          form_structure: Json | null
          id: string
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by: string
          days_to_close: number
          days_to_due: number
          days_to_open: number
          description?: string | null
          difficulty: string
          estimated_time: string
          form_structure?: Json | null
          id?: string
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          days_to_close?: number
          days_to_due?: number
          days_to_open?: number
          description?: string | null
          difficulty?: string
          estimated_time?: string
          form_structure?: Json | null
          id?: string
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          id: string
          title: string
          description: string | null
          telegram_channels: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          telegram_channels?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          telegram_channels?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      group_courses: {
        Row: {
          id: string
          group_id: string
          course_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          id?: string
          group_id: string
          course_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          course_id?: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_courses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_courses_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          class_id: string | null
          class_name: string | null
          created_at: string | null
          email: string | null
          id: string
          first_name: string | null
          last_name: string | null
          role: string | null
          updated_at: string | null
          gender: string | null
          job: string | null
          education: string | null
          phone_number: string | null
          country: string | null
          city: string | null
          birthday: string | null
          ai_familiarity: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          english_level: 'beginner' | 'intermediate' | 'advanced' | 'native' | null
          telegram_id: string | null
          whatsapp_id: string | null
          is_demo: boolean | null
        }
        Insert: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          gender?: string | null
          job?: string | null
          education?: string | null
          phone_number?: string | null
          country?: string | null
          city?: string | null
          birthday?: string | null
          ai_familiarity?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          english_level?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null
          telegram_id?: string | null
          whatsapp_id?: string | null
          is_demo?: boolean | null
        }
        Update: {
          class_id?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          gender?: string | null
          job?: string | null
          education?: string | null
          phone_number?: string | null
          country?: string | null
          city?: string | null
          birthday?: string | null
          ai_familiarity?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          english_level?: 'beginner' | 'intermediate' | 'advanced' | 'native' | null
          telegram_id?: string | null
          whatsapp_id?: string | null
          is_demo?: boolean | null
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
      },
      daily_activities: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: []
      },
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
          id: string
          task_id: string
          title: string
          description: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          description?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          description?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
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
          id: string
          title: string
          description: string | null
          assigned_to: string | null
          assigned_by: string | null
          status: string
          priority: string
          due_date: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_course_assignments: {
        Row: {
          id: string
          teacher_id: string
          course_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          id?: string
          teacher_id: string
          course_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string
          course_id?: string
          assigned_at?: string
          assigned_by?: string | null
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
      accounting: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          amount: number;
          description: string | null;
          payment_method: string | null;
          payment_status: PaymentStatus;
          payment_type: PaymentType;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          amount: number;
          description?: string | null;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          payment_type?: PaymentType;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          amount?: number;
          description?: string | null;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          payment_type?: PaymentType;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounting_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounting_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      wiki_categories: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          access_type: 'all_students' | 'course_specific';
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          access_type?: 'all_students' | 'course_specific';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          access_type?: 'all_students' | 'course_specific';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wiki_categories_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      wiki_topics: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wiki_topics_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "wiki_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wiki_topics_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      wiki_articles: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          content: string;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          content: string;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          content?: string;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wiki_articles_topic_id_fkey";
            columns: ["topic_id"];
            referencedRelation: "wiki_topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wiki_articles_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_achievements: {
        Args: { student_id_param: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_student_enrolled_in_course: {
        Args: { course_id: string; student_id: string }
        Returns: boolean
      }
      log_student_activity: {
        Args: {
          p_student_id: string
          p_activity_type: string
          p_activity_data?: Json
          p_points_earned?: number
          p_session_id?: string
          p_duration_minutes?: number
        }
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

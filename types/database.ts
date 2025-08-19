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
      books: {
        Row: {
          author: string | null
          completion_date: string | null
          created_at: string | null
          current_page: number | null
          id: string
          notes: string | null
          rating: number | null
          start_date: string | null
          status: string | null
          title: string
          total_pages: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author?: string | null
          completion_date?: string | null
          created_at?: string | null
          current_page?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          total_pages?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author?: string | null
          completion_date?: string | null
          created_at?: string | null
          current_page?: number | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_pages?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          assignee: string | null
          created_at: string | null
          description: string | null
          end_datetime: string
          event_type: string | null
          id: string
          location: string | null
          priority: string | null
          start_datetime: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime: string
          event_type?: string | null
          id?: string
          location?: string | null
          priority?: string | null
          start_datetime: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string
          event_type?: string | null
          id?: string
          location?: string | null
          priority?: string | null
          start_datetime?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean | null
          metadata: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          sender: string
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender: string
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          last_edited_by: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          last_edited_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          birthday: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          important_dates: Json | null
          last_contact: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          preferences: Json | null
          relationship: string | null
          social_media: Json | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          important_dates?: Json | null
          last_contact?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          relationship?: string | null
          social_media?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birthday?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          important_dates?: Json | null
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          relationship?: string | null
          social_media?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          certificate_url: string | null
          completed_lessons: number | null
          completion_date: string | null
          created_at: string | null
          id: string
          instructor: string | null
          notes: string | null
          platform: string | null
          start_date: string | null
          status: string | null
          title: string
          total_lessons: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_lessons?: number | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          instructor?: string | null
          notes?: string | null
          platform?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_lessons?: number | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          instructor?: string | null
          notes?: string | null
          platform?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_routines: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      diet_plan_items: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          description: string | null
          fats: number | null
          id: string
          ingredients: string | null
          is_active: boolean | null
          meal_type: string
          name: string
          notes: string | null
          protein: number | null
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          description?: string | null
          fats?: number | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          meal_type: string
          name: string
          notes?: string | null
          protein?: number | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          description?: string | null
          fats?: number | null
          id?: string
          ingredients?: string | null
          is_active?: boolean | null
          meal_type?: string
          name?: string
          notes?: string | null
          protein?: number | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_fields: {
        Row: {
          created_at: string | null
          document_id: string | null
          field_type: string | null
          field_value: string
          id: string
          is_secret: boolean | null
          label: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          field_type?: string | null
          field_value: string
          id?: string
          is_secret?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          field_type?: string | null
          field_value?: string
          id?: string
          is_secret?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "secure_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      health_focus: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_current: boolean | null
          key_metrics: Json | null
          period: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_current?: boolean | null
          key_metrics?: Json | null
          period: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_current?: boolean | null
          key_metrics?: Json | null
          period?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          category: string
          created_at: string | null
          current_value: string | null
          description: string | null
          id: string
          notes: string | null
          priority: number | null
          status: string | null
          target_date: string | null
          target_value: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          target_date?: string | null
          target_value?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string | null
          target_date?: string | null
          target_value?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          body_fat_percentage: number | null
          created_at: string | null
          heart_rate_avg: number | null
          id: string
          metric_date: string | null
          notes: string | null
          sleep_hours: number | null
          steps: number | null
          updated_at: string | null
          user_id: string | null
          water_intake: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          heart_rate_avg?: number | null
          id?: string
          metric_date?: string | null
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          heart_rate_avg?: number | null
          id?: string
          metric_date?: string | null
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          fats: number | null
          id: string
          meal_date: string | null
          meal_time: string | null
          name: string
          notes: string | null
          protein: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fats?: number | null
          id?: string
          meal_date?: string | null
          meal_time?: string | null
          name: string
          notes?: string | null
          protein?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fats?: number | null
          id?: string
          meal_date?: string | null
          meal_time?: string | null
          name?: string
          notes?: string | null
          protein?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      note_edit_history: {
        Row: {
          content_change: string | null
          edit_type: string
          id: string
          note_id: string | null
          timestamp: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          content_change?: string | null
          edit_type: string
          id?: string
          note_id?: string | null
          timestamp?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          content_change?: string | null
          edit_type?: string
          id?: string
          note_id?: string | null
          timestamp?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_edit_history_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "collaborative_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          metadata: Json | null
          note_date: string | null
          note_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          note_date?: string | null
          note_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          note_date?: string | null
          note_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nutrition_guidelines: {
        Row: {
          carbs_target: number | null
          created_at: string | null
          daily_calories: number | null
          fat_target: number | null
          id: string
          notes: string | null
          protein_target: number | null
          updated_at: string | null
          user_id: string | null
          water_target: number | null
        }
        Insert: {
          carbs_target?: number | null
          created_at?: string | null
          daily_calories?: number | null
          fat_target?: number | null
          id?: string
          notes?: string | null
          protein_target?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_target?: number | null
        }
        Update: {
          carbs_target?: number | null
          created_at?: string | null
          daily_calories?: number | null
          fat_target?: number | null
          id?: string
          notes?: string | null
          protein_target?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_target?: number | null
        }
        Relationships: []
      }
      personal_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      routine_items: {
        Row: {
          category: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_completed: boolean | null
          name: string
          routine_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_completed?: boolean | null
          name: string
          routine_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_completed?: boolean | null
          name?: string
          routine_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_items_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "daily_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_documents: {
        Row: {
          category: string | null
          created_at: string | null
          document_type: string | null
          expiry_date: string | null
          id: string
          is_encrypted: boolean | null
          last_accessed: string | null
          notes: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          id?: string
          is_encrypted?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          id?: string
          is_encrypted?: boolean | null
          last_accessed?: string | null
          notes?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      supplements: {
        Row: {
          created_at: string | null
          dosage: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          start_date: string | null
          time_of_day: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          start_date?: string | null
          time_of_day?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          start_date?: string | null
          time_of_day?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimate: string | null
          id: string
          labels: string[] | null
          payment_amount: number | null
          payment_date: string | null
          payment_notes: string | null
          payment_status: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimate?: string | null
          id?: string
          labels?: string[] | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimate?: string | null
          id?: string
          labels?: string[] | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          minutes: number | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          minutes?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          minutes?: number | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vision_cards: {
        Row: {
          card_type: string
          content: string
          created_at: string | null
          id: string
          position_x: number | null
          position_y: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_type: string
          content: string
          created_at?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_type?: string
          content?: string
          created_at?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_schedule: {
        Row: {
          created_at: string | null
          friday: string | null
          id: string
          monday: string | null
          saturday: string | null
          sunday: string | null
          thursday: string | null
          tuesday: string | null
          updated_at: string | null
          user_id: string
          wednesday: string | null
        }
        Insert: {
          created_at?: string | null
          friday?: string | null
          id?: string
          monday?: string | null
          saturday?: string | null
          sunday?: string | null
          thursday?: string | null
          tuesday?: string | null
          updated_at?: string | null
          user_id: string
          wednesday?: string | null
        }
        Update: {
          created_at?: string | null
          friday?: string | null
          id?: string
          monday?: string | null
          saturday?: string | null
          sunday?: string | null
          thursday?: string | null
          tuesday?: string | null
          updated_at?: string | null
          user_id?: string
          wednesday?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          notes: string | null
          reps: string | null
          rest_time: string | null
          routine_id: string | null
          sets: number | null
          sort_order: number | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          reps?: string | null
          rest_time?: string | null
          routine_id?: string | null
          sets?: number | null
          sort_order?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          reps?: string | null
          rest_time?: string | null
          routine_id?: string | null
          sets?: number | null
          sort_order?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string | null
          duration: number | null
          exercises: string[] | null
          id: string
          intensity: number | null
          name: string
          notes: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          workout_date: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          exercises?: string[] | null
          id?: string
          intensity?: number | null
          name: string
          notes?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workout_date?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          exercises?: string[] | null
          id?: string
          intensity?: number | null
          name?: string
          notes?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workout_date?: string | null
        }
        Relationships: []
      }
      workout_notes: {
        Row: {
          created_at: string | null
          current_focus: string | null
          general_notes: string | null
          id: string
          progression: string | null
          rest_times: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_focus?: string | null
          general_notes?: string | null
          id?: string
          progression?: string | null
          rest_times?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_focus?: string | null
          general_notes?: string | null
          id?: string
          progression?: string | null
          rest_times?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_routines: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          description: string | null
          id: string
          is_active: boolean | null
          muscle_groups: string[] | null
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          muscle_groups?: string[] | null
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          muscle_groups?: string[] | null
          name?: string
          notes?: string | null
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
      check_user_access: {
        Args: { target_user_id: string }
        Returns: boolean
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

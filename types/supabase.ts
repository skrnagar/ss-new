export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          headline: string | null;
          bio: string | null;
          company: string | null;
          position: string | null;
          location: string | null;
          phone?: string | null;
          created_at: string;
          cover_image_url?: string | null;
          is_profile_public?: boolean | null;
          recruiter_visible?: boolean | null;
          auditor_visible?: boolean | null;
          cv_url?: string | null;
          cv_visibility?: string | null;
          resume_parsed_json?: Json | null;
          years_experience?: number | null;
          linkedin?: string | null;
          twitter?: string | null;
          verified?: boolean | null;
          badges?: string[] | null;
          professional_role?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          auditor_verification_status?: string | null;
          auditor_verification_requested_at?: string | null;
          auditor_verification_reviewed_at?: string | null;
          auditor_verification_notes?: string | null;
          auditor_services_summary?: string | null;
          email_job_alerts?: boolean | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          headline?: string | null;
          bio?: string | null;
          company?: string | null;
          position?: string | null;
          location?: string | null;
          phone?: string | null;
          created_at?: string;
          cover_image_url?: string | null;
          is_profile_public?: boolean | null;
          recruiter_visible?: boolean | null;
          auditor_visible?: boolean | null;
          cv_url?: string | null;
          cv_visibility?: string | null;
          resume_parsed_json?: Json | null;
          years_experience?: number | null;
          linkedin?: string | null;
          twitter?: string | null;
          verified?: boolean | null;
          badges?: string[] | null;
          professional_role?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          auditor_verification_status?: string | null;
          auditor_verification_requested_at?: string | null;
          auditor_verification_reviewed_at?: string | null;
          auditor_verification_notes?: string | null;
          auditor_services_summary?: string | null;
          email_job_alerts?: boolean | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          headline?: string | null;
          bio?: string | null;
          company?: string | null;
          position?: string | null;
          location?: string | null;
          phone?: string | null;
          created_at?: string;
          cover_image_url?: string | null;
          is_profile_public?: boolean | null;
          recruiter_visible?: boolean | null;
          auditor_visible?: boolean | null;
          cv_url?: string | null;
          cv_visibility?: string | null;
          resume_parsed_json?: Json | null;
          years_experience?: number | null;
          linkedin?: string | null;
          twitter?: string | null;
          verified?: boolean | null;
          badges?: string[] | null;
          professional_role?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          auditor_verification_status?: string | null;
          auditor_verification_requested_at?: string | null;
          auditor_verification_reviewed_at?: string | null;
          auditor_verification_notes?: string | null;
          auditor_services_summary?: string | null;
          email_job_alerts?: boolean | null;
        };
      };
      posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          content: string;
          author_id: string;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          content: string;
          author_id: string;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          content?: string;
          author_id?: string;
          image_url?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string | null;
          location: string | null;
          organizer_id: string;
          image_url: string | null;
          event_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_date: string;
          end_date?: string | null;
          location?: string | null;
          organizer_id: string;
          image_url?: string | null;
          event_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string | null;
          location?: string | null;
          organizer_id?: string;
          image_url?: string | null;
          event_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      knowledge_resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          industry: string | null;
          tags: string[] | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          external_url: string | null;
          expires_at: string | null;
          download_count: number | null;
          status: string;
          contributed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          industry?: string | null;
          tags?: string[] | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          external_url?: string | null;
          expires_at?: string | null;
          download_count?: number | null;
          status?: string;
          contributed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          industry?: string | null;
          tags?: string[] | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          external_url?: string | null;
          expires_at?: string | null;
          download_count?: number | null;
          status?: string;
          contributed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          proficiency: number | null;
          industry_tag: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          proficiency?: number | null;
          industry_tag?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          proficiency?: number | null;
          industry_tag?: string | null;
          created_at?: string;
        };
      };
      profile_skill_endorsements: {
        Row: {
          id: string;
          skill_id: string;
          endorser_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          skill_id: string;
          endorser_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          skill_id?: string;
          endorser_id?: string;
          created_at?: string;
        };
      };
      profile_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          project_url: string | null;
          start_date: string | null;
          end_date: string | null;
          is_international: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          project_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_international?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          project_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_international?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_achievements: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          achieved_at: string | null;
          award_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          achieved_at?: string | null;
          award_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          achieved_at?: string | null;
          award_url?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          content: string;
          link: string | null;
          read: boolean;
          created_at: string;
          email_sent_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          content: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
          email_sent_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          content?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
          email_sent_at?: string | null;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company_id: string | null;
          company_name: string;
          posted_by: string;
          description: string;
          employment_type: string | null;
          workplace_type: string | null;
          location: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          experience_level: string | null;
          industry: string | null;
          job_category: string | null;
          skills_required: string[] | null;
          benefits: string[] | null;
          application_deadline: string | null;
          is_active: boolean | null;
          views_count: number | null;
          applications_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company_id?: string | null;
          company_name: string;
          posted_by: string;
          description: string;
          employment_type?: string | null;
          workplace_type?: string | null;
          location?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          experience_level?: string | null;
          industry?: string | null;
          job_category?: string | null;
          skills_required?: string[] | null;
          benefits?: string[] | null;
          application_deadline?: string | null;
          is_active?: boolean | null;
          views_count?: number | null;
          applications_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          company_id?: string | null;
          company_name?: string;
          posted_by?: string;
          description?: string;
          employment_type?: string | null;
          workplace_type?: string | null;
          location?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          experience_level?: string | null;
          industry?: string | null;
          job_category?: string | null;
          skills_required?: string[] | null;
          benefits?: string[] | null;
          application_deadline?: string | null;
          is_active?: boolean | null;
          views_count?: number | null;
          applications_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_alerts: {
        Row: {
          id: string;
          user_id: string;
          keywords: string[] | null;
          location: string | null;
          employment_type: string | null;
          experience_level: string | null;
          industry: string | null;
          frequency: string | null;
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keywords?: string[] | null;
          location?: string | null;
          employment_type?: string | null;
          experience_level?: string | null;
          industry?: string | null;
          frequency?: string | null;
          is_active?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keywords?: string[] | null;
          location?: string | null;
          employment_type?: string | null;
          experience_level?: string | null;
          industry?: string | null;
          frequency?: string | null;
          is_active?: boolean | null;
          created_at?: string;
        };
      };
      audit_bookings: {
        Row: {
          id: string;
          client_id: string;
          auditor_id: string;
          status: string;
          scheduled_start: string | null;
          scheduled_end: string | null;
          site_address: string | null;
          site_notes: string | null;
          scope_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          auditor_id: string;
          status?: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          site_address?: string | null;
          site_notes?: string | null;
          scope_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          auditor_id?: string;
          status?: string;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          site_address?: string | null;
          site_notes?: string | null;
          scope_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_checklist_items: {
        Row: {
          id: string;
          booking_id: string;
          sort_order: number;
          title: string;
          description: string | null;
          is_completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          sort_order?: number;
          title: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          sort_order?: number;
          title?: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          notes?: string | null;
        };
      };
      audit_evidence: {
        Row: {
          id: string;
          booking_id: string;
          checklist_item_id: string | null;
          file_path: string;
          file_name: string;
          mime_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          checklist_item_id?: string | null;
          file_path: string;
          file_name: string;
          mime_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          checklist_item_id?: string | null;
          file_path?: string;
          file_name?: string;
          mime_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      audit_reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          auditor_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          reviewer_id: string;
          auditor_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          reviewer_id?: string;
          auditor_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          reported_by: string;
          title: string;
          severity: string;
          category: string | null;
          status: string;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reported_by: string;
          title: string;
          severity?: string;
          category?: string | null;
          status?: string;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reported_by?: string;
          title?: string;
          severity?: string;
          category?: string | null;
          status?: string;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      esg_metric_entries: {
        Row: {
          id: string;
          owner_id: string;
          period_month: string;
          metric_type: string;
          value: number | null;
          unit: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          period_month: string;
          metric_type: string;
          value?: number | null;
          unit?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          period_month?: string;
          metric_type?: string;
          value?: number | null;
          unit?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lms_courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          duration_minutes: number | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          duration_minutes?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          duration_minutes?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
      };
      lms_modules: {
        Row: {
          id: string;
          course_id: string;
          sort_order: number;
          title: string;
          module_type: string;
          video_url: string | null;
          content_md: string | null;
          quiz_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          sort_order?: number;
          title: string;
          module_type: string;
          video_url?: string | null;
          content_md?: string | null;
          quiz_json?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          sort_order?: number;
          title?: string;
          module_type?: string;
          video_url?: string | null;
          content_md?: string | null;
          quiz_json?: Json | null;
          created_at?: string;
        };
      };
      lms_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress_percent: number;
          completed_at: string | null;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress_percent?: number;
          completed_at?: string | null;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress_percent?: number;
          completed_at?: string | null;
          enrolled_at?: string;
        };
      };
      lms_certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          credential_code: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          credential_code: string;
          issued_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          credential_code?: string;
          issued_at?: string;
        };
      };
      compliance_items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          framework: string | null;
          due_date: string | null;
          status: string;
          notes: string | null;
          evidence_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          framework?: string | null;
          due_date?: string | null;
          status?: string;
          notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          framework?: string | null;
          due_date?: string | null;
          status?: string;
          notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_knowledge_download: {
        Args: { resource_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

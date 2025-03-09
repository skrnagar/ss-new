
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          headline: string | null
          bio: string | null
          company: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          headline?: string | null
          bio?: string | null
          company?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          headline?: string | null
          bio?: string | null
          company?: string | null
          location?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          content: string
          author_id: string
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          content: string
          author_id: string
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          content?: string
          author_id?: string
          image_url?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string | null
          location: string | null
          organizer_id: string
          image_url: string | null
          event_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date?: string | null
          location?: string | null
          organizer_id: string
          image_url?: string | null
          event_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string | null
          location?: string | null
          organizer_id?: string
          image_url?: string | null
          event_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
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
  }
}

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
          email: string
          full_name: string | null
          phone: string | null
          profile_picture_url: string | null
          date_of_birth: string | null
          preferred_language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          date_of_birth?: string | null
          preferred_language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          date_of_birth?: string | null
          preferred_language?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          address_type: 'home' | 'work' | 'other'
          label: string
          street_address: string
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address_type: 'home' | 'work' | 'other'
          label: string
          street_address: string
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address_type?: 'home' | 'work' | 'other'
          label?: string
          street_address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_quotes: boolean
          email_updates: boolean
          email_marketing: boolean
          sms_quotes: boolean
          sms_updates: boolean
          push_notifications: boolean
          profile_visibility: 'private' | 'public'
          data_sharing: boolean
          analytics_opt_out: boolean
          two_factor_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_quotes?: boolean
          email_updates?: boolean
          email_marketing?: boolean
          sms_quotes?: boolean
          sms_updates?: boolean
          push_notifications?: boolean
          profile_visibility?: 'private' | 'public'
          data_sharing?: boolean
          analytics_opt_out?: boolean
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_quotes?: boolean
          email_updates?: boolean
          email_marketing?: boolean
          sms_quotes?: boolean
          sms_updates?: boolean
          push_notifications?: boolean
          profile_visibility?: 'private' | 'public'
          data_sharing?: boolean
          analytics_opt_out?: boolean
          two_factor_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      solar_quotes: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          location: string
          state: string
          budget_range: string
          property_type: string
          roof_type: string | null
          energy_usage: number | null
          system_size: number | null
          estimated_cost: number | null
          estimated_savings: number | null
          rebate_amount: number | null
          status: 'pending' | 'quoted' | 'contacted' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          location: string
          state: string
          budget_range: string
          property_type: string
          roof_type?: string | null
          energy_usage?: number | null
          system_size?: number | null
          estimated_cost?: number | null
          estimated_savings?: number | null
          rebate_amount?: number | null
          status?: 'pending' | 'quoted' | 'contacted' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          location?: string
          state?: string
          budget_range?: string
          property_type?: string
          roof_type?: string | null
          energy_usage?: number | null
          system_size?: number | null
          estimated_cost?: number | null
          estimated_savings?: number | null
          rebate_amount?: number | null
          status?: 'pending' | 'quoted' | 'contacted' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      installers: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          email: string
          phone: string
          website: string | null
          license_number: string
          service_areas: string[]
          rating: number
          reviews_count: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_name: string
          email: string
          phone: string
          website?: string | null
          license_number: string
          service_areas: string[]
          rating?: number
          reviews_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_name?: string
          email?: string
          phone?: string
          website?: string | null
          license_number?: string
          service_areas?: string[]
          rating?: number
          reviews_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          author: string
          category: string
          read_time: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content: string
          author: string
          category: string
          read_time: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          author?: string
          category?: string
          read_time?: string
          published?: boolean
          created_at?: string
          updated_at?: string
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
      quote_status: 'pending' | 'quoted' | 'contacted' | 'completed'
      address_type: 'home' | 'work' | 'other'
      profile_visibility: 'private' | 'public'
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserAddress = Database['public']['Tables']['user_addresses']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type SolarQuote = Database['public']['Tables']['solar_quotes']['Row'];
export type Installer = Database['public']['Tables']['installers']['Row'];
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertUserAddress = Database['public']['Tables']['user_addresses']['Insert'];
export type InsertUserPreferences = Database['public']['Tables']['user_preferences']['Insert'];
export type InsertSolarQuote = Database['public']['Tables']['solar_quotes']['Insert'];
export type InsertInstaller = Database['public']['Tables']['installers']['Insert'];
export type InsertNewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Insert'];
export type InsertBlogPost = Database['public']['Tables']['blog_posts']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateUserAddress = Database['public']['Tables']['user_addresses']['Update'];
export type UpdateUserPreferences = Database['public']['Tables']['user_preferences']['Update'];
export type UpdateSolarQuote = Database['public']['Tables']['solar_quotes']['Update'];
export type UpdateInstaller = Database['public']['Tables']['installers']['Update'];
export type UpdateNewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Update'];
export type UpdateBlogPost = Database['public']['Tables']['blog_posts']['Update'];
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          twitter: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          twitter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          twitter?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          content: any;
          excerpt: string | null;
          published: boolean;
          author_id: string;
          created_at: string;
          updated_at: string;
          likes_count: number;
          comments_count: number;
          views_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          content: any;
          excerpt?: string | null;
          published?: boolean;
          author_id: string;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          content?: any;
          excerpt?: string | null;
          published?: boolean;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          blog_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          blog_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          blog_id?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
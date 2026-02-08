import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lgsiafwtadkaxpidmink.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnc2lhZnd0YWRrYXhwaWRtaW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzQxNTcsImV4cCI6MjA4NjExMDE1N30.EivYY-QV71lfEoBPITnhYTLgAlUuixLMSm3J-_bRZes';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_scores: {
        Row: {
          id: string;
          user_id: string;
          mode: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: string;
          score?: number;
          created_at?: string;
        };
      };
      user_skins: {
        Row: {
          id: string;
          user_id: string;
          skin_id: string;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skin_id: string;
          purchased_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skin_id?: string;
          purchased_at?: string;
        };
      };
      user_tokens: {
        Row: {
          user_id: string;
          tokens: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tokens?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tokens?: number;
          updated_at?: string;
        };
      };
    };
  };
};

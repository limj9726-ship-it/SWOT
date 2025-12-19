import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export type Database = {
  public: {
    Tables: {
      swot_analyses: {
        Row: {
          id: string;
          title: string;
          description: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          updated_at?: string;
        };
      };
      swot_items: {
        Row: {
          id: string;
          swot_analysis_id: string;
          category: 'strength' | 'weakness' | 'opportunity' | 'threat';
          content: string;
          created_at: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          swot_analysis_id: string;
          category: 'strength' | 'weakness' | 'opportunity' | 'threat';
          content: string;
          created_at?: string;
          order_index?: number;
        };
        Update: {
          content?: string;
          order_index?: number;
        };
      };
      swot_strategies: {
        Row: {
          id: string;
          swot_analysis_id: string;
          type: 'SO' | 'WO' | 'ST' | 'WT';
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          swot_analysis_id: string;
          type: 'SO' | 'WO' | 'ST' | 'WT';
          description: string;
          created_at?: string;
        };
        Update: {
          description?: string;
        };
      };
    };
  };
};

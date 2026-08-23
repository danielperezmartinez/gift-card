export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  gift_card: {
    Tables: {
      shared_cards: {
        Row: {
          balance: number;
          color: string | null;
          created_at: number;
          description: string;
          id: string;
          initial_amount: number;
          name: string;
        };
        Insert: {
          balance: number;
          color?: string | null;
          created_at: number;
          description: string;
          id: string;
          initial_amount: number;
          name: string;
        };
        Update: {
          balance?: number;
          color?: string | null;
          created_at?: number;
          description?: string;
          id?: string;
          initial_amount?: number;
          name?: string;
        };
        Relationships: [];
      };
      shared_expenses: {
        Row: {
          amount: number;
          card_id: string;
          date: number;
          id: string;
        };
        Insert: {
          amount: number;
          card_id: string;
          date: number;
          id: string;
        };
        Update: {
          amount?: number;
          card_id?: string;
          date?: number;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shared_expenses_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'shared_cards';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
          edit_token_hash: string | null;
          id: string;
          initial_amount: number;
          name: string;
          shared_at: string;
        };
        Insert: {
          balance: number;
          color?: string | null;
          created_at: number;
          description: string;
          edit_token_hash?: string | null;
          id: string;
          initial_amount: number;
          name: string;
          shared_at?: string;
        };
        Update: {
          balance?: number;
          color?: string | null;
          created_at?: number;
          description?: string;
          edit_token_hash?: string | null;
          id?: string;
          initial_amount?: number;
          name?: string;
          shared_at?: string;
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
      add_shared_expense: {
        Args: {
          p_amount: number;
          p_card_id: string;
          p_date: number;
          p_edit_token: string;
          p_expense_id: string;
        };
        Returns: number;
      };
      claim_shared_card: {
        Args: { p_card_id: string; p_edit_token: string };
        Returns: boolean;
      };
      create_shared_card: {
        Args: {
          p_color: string | null;
          p_created_at: number;
          p_description: string;
          p_edit_token: string;
          p_expenses?: Json;
          p_id: string;
          p_initial_amount: number;
          p_name: string;
        };
        Returns: number;
      };
      delete_shared_card: {
        Args: { p_card_id: string; p_edit_token: string };
        Returns: undefined;
      };
      get_shared_card: {
        Args: { p_id: string };
        Returns: Json;
      };
      remove_shared_expense: {
        Args: { p_card_id: string; p_edit_token: string; p_expense_id: string };
        Returns: number;
      };
      update_shared_card_color: {
        Args: { p_card_id: string; p_color: string; p_edit_token: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

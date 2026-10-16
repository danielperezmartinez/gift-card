import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { GiftCard, Expense } from '../models/gift-card.model';
import { Database } from '../models/database';

const GIFT_CARD_SCHEMA = 'gift_card' as const;

interface SharedCardPayload {
  id: string;
  name: string;
  description: string;
  initial_amount: number;
  balance: number;
  created_at: number;
  color: string | null;
  expenses: Expense[];
}

// Tables are closed to the public key: every read and write goes through the
// gift_card RPC functions, and edits require the card's edit token.
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient<Database, typeof GIFT_CARD_SCHEMA>;

  constructor() {
    this.supabase = createClient<Database, typeof GIFT_CARD_SCHEMA>(
      environment.supabase.url,
      environment.supabase.publicKey,
      { db: { schema: GIFT_CARD_SCHEMA } },
    );
  }

  async shareCard(card: GiftCard, editToken: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('create_shared_card', {
      p_id: card.id,
      p_name: card.name,
      p_description: card.description,
      p_initial_amount: card.initialAmount,
      p_created_at: card.createdAt,
      p_color: card.color ?? null,
      p_edit_token: editToken,
      p_expenses: card.expenses.map((e) => ({ id: e.id, amount: e.amount, date: e.date })),
    });

    if (error) throw error;
    return data;
  }

  async claimSharedCard(cardId: string, editToken: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('claim_shared_card', {
      p_card_id: cardId,
      p_edit_token: editToken,
    });

    if (error) throw error;
    return data;
  }

  async getSharedCard(id: string): Promise<GiftCard | null> {
    const { data, error } = await this.supabase.rpc('get_shared_card', { p_id: id });

    if (error) throw error;
    if (!data) return null;

    const card = data as unknown as SharedCardPayload;
    return {
      id: card.id,
      name: card.name,
      description: card.description,
      initialAmount: Number(card.initial_amount),
      balance: Number(card.balance),
      createdAt: card.created_at,
      color: card.color ?? undefined,
      isShared: true,
      expenses: card.expenses.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        date: e.date,
      })),
    };
  }

  async addExpense(cardId: string, editToken: string, expense: Expense): Promise<number> {
    const { data, error } = await this.supabase.rpc('add_shared_expense', {
      p_card_id: cardId,
      p_edit_token: editToken,
      p_expense_id: expense.id,
      p_amount: expense.amount,
      p_date: expense.date,
    });

    if (error) throw error;
    return data;
  }

  async removeExpense(cardId: string, editToken: string, expenseId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('remove_shared_expense', {
      p_card_id: cardId,
      p_edit_token: editToken,
      p_expense_id: expenseId,
    });

    if (error) throw error;
    return data;
  }

  async updateCardColor(cardId: string, editToken: string, color: string): Promise<void> {
    const { error } = await this.supabase.rpc('update_shared_card_color', {
      p_card_id: cardId,
      p_edit_token: editToken,
      p_color: color,
    });

    if (error) throw error;
  }

  // The database broadcasts an empty "changed" event; subscribers re-fetch through
  // get_shared_card so no card data travels over the public channel.
  subscribeToCardUpdates(cardId: string, callback: () => void): RealtimeChannel {
    return this.supabase
      .channel(`${GIFT_CARD_SCHEMA}:${cardId}`)
      .on('broadcast', { event: 'changed' }, () => callback())
      .subscribe();
  }

  unsubscribe(channel: RealtimeChannel) {
    this.supabase.removeChannel(channel);
  }
}

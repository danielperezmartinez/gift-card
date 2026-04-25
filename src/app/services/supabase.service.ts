import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { GiftCard, Expense } from '../models/gift-card.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.publicKey);
  }

  async shareCard(card: GiftCard): Promise<void> {
    // Upsert the card first
    const { error: cardError } = await this.supabase
      .from('shared_cards')
      .upsert({
        id: card.id,
        name: card.name,
        description: card.description,
        initial_amount: card.initialAmount,
        balance: card.balance,
        created_at: card.createdAt,
        color: card.color
      });

    if (cardError) throw cardError;

    // Then insert all expenses if any
    if (card.expenses && card.expenses.length > 0) {
      const expensesToInsert = card.expenses.map(e => ({
        id: e.id,
        card_id: card.id,
        amount: e.amount,
        date: e.date
      }));
      
      const { error: expensesError } = await this.supabase
        .from('shared_expenses')
        .upsert(expensesToInsert);
        
      if (expensesError) throw expensesError;
    }
  }

  async getSharedCard(id: string): Promise<GiftCard | null> {
    const { data: cardData, error: cardError } = await this.supabase
      .from('shared_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (cardError || !cardData) return null;

    const { data: expensesData, error: expensesError } = await this.supabase
      .from('shared_expenses')
      .select('*')
      .eq('card_id', id)
      .order('date', { ascending: false });

    if (expensesError) throw expensesError;

    return {
      id: cardData.id,
      name: cardData.name,
      description: cardData.description,
      initialAmount: cardData.initial_amount,
      balance: cardData.balance,
      createdAt: cardData.created_at,
      color: cardData.color,
      isShared: true,
      expenses: (expensesData || []).map(e => ({
        id: e.id,
        amount: e.amount,
        date: e.date
      }))
    };
  }

  async addExpense(cardId: string, expense: Expense, newBalance: number): Promise<void> {
    // Add the expense
    const { error: expenseError } = await this.supabase
      .from('shared_expenses')
      .insert({
        id: expense.id,
        card_id: cardId,
        amount: expense.amount,
        date: expense.date
      });

    if (expenseError) throw expenseError;

    // Update the card balance
    const { error: cardError } = await this.supabase
      .from('shared_cards')
      .update({ balance: newBalance })
      .eq('id', cardId);

    if (cardError) throw cardError;
  }

  async removeExpense(cardId: string, expenseId: string, newBalance: number): Promise<void> {
    // Delete the expense
    const { error: expenseError } = await this.supabase
      .from('shared_expenses')
      .delete()
      .eq('id', expenseId);

    if (expenseError) throw expenseError;

    // Update the card balance
    const { error: cardError } = await this.supabase
      .from('shared_cards')
      .update({ balance: newBalance })
      .eq('id', cardId);

    if (cardError) throw cardError;
  }

  async updateCardColor(cardId: string, color: string): Promise<void> {
    const { error: cardError } = await this.supabase
      .from('shared_cards')
      .update({ color })
      .eq('id', cardId);

    if (cardError) throw cardError;
  }

  subscribeToCardUpdates(cardId: string, callback: () => void) {
    return this.supabase
      .channel(`card_${cardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_cards', filter: `id=eq.${cardId}` },
        () => callback()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_expenses', filter: `card_id=eq.${cardId}` },
        () => callback()
      )
      .subscribe();
  }

  unsubscribe(channel: ReturnType<SupabaseClient['channel']>) {
    this.supabase.removeChannel(channel);
  }
}

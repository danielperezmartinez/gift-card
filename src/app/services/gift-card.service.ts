import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { GiftCard, Expense } from '../models/gift-card.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {
  private readonly STORAGE_KEY = 'gift_cards_data';
  private supabase = inject(SupabaseService);
  
  // State
  private readonly _cards = signal<GiftCard[]>(this.loadFromStorage());

  // Selectors
  readonly cards = this._cards.asReadonly();

  constructor() {
    // Persist to storage whenever the cards signal changes
    effect(() => {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._cards()));
      } catch (err) {
        console.error('Error saving to localStorage', err);
      }
    });

    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    const cards = this._cards();
    for (const card of cards) {
      if (card.isShared) {
        this.syncSharedCard(card.id);
        this.supabase.subscribeToCardUpdates(card.id, () => {
          this.syncSharedCard(card.id);
        });
      }
    }
  }

  private async syncSharedCard(id: string) {
    const remoteCard = await this.supabase.getSharedCard(id);
    if (remoteCard) {
      this._cards.update(cards => {
        const index = cards.findIndex(c => c.id === id);
        if (index === -1) return cards;
        
        const updated = [...cards];
        updated[index] = {
          ...updated[index],
          balance: remoteCard.balance,
          expenses: remoteCard.expenses,
          isShared: true
        };
        return updated;
      });
    }
  }

  async shareCard(id: string) {
    const card = this._cards().find(c => c.id === id);
    if (!card) return;

    const cardToShare = { ...card, isShared: true };

    // Upload to Supabase first
    await this.supabase.shareCard(cardToShare);

    // Mark as shared locally
    this._cards.update(cards => {
      const updated = [...cards];
      const index = updated.findIndex(c => c.id === id);
      updated[index] = cardToShare;
      return updated;
    });

    // Subscribe to future updates
    this.supabase.subscribeToCardUpdates(id, () => {
      this.syncSharedCard(id);
    });
  }

  getCardById(id: string) {
    return computed(() => this._cards().find(c => c.id === id));
  }

  addCard(name: string, description: string, initialAmount: number, color?: string) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const newCard: GiftCard = {
      id,
      name,
      description,
      initialAmount,
      balance: initialAmount,
      expenses: [],
      createdAt: Date.now(),
      color
    };
    
    console.log('Adding new card:', newCard);
    this._cards.update(cards => {
      const currentCards = Array.isArray(cards) ? cards : [];
      const updated = [...currentCards, newCard];
      console.log('Updated cards list:', updated);
      return updated;
    });
  }

  deleteCard(id: string) {
    this._cards.update(cards => Array.isArray(cards) ? cards.filter(c => c.id !== id) : []);
  }

  async addExpense(cardId: string, amount: number) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
    const expense: Expense = {
      id,
      amount,
      date: Date.now()
    };

    let isShared = false;
    let newBalance = 0;

    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          isShared = !!card.isShared;
          newBalance = card.balance - amount;
          return {
            ...card,
            balance: newBalance,
            expenses: [expense, ...card.expenses]
          };
        }
        return card;
      });
    });

    if (isShared) {
      try {
        await this.supabase.addExpense(cardId, expense, newBalance);
      } catch (e) {
        console.error('Failed to sync expense to Supabase', e);
      }
    }
  }

  async deleteExpense(cardId: string, expenseId: string) {
    let isShared = false;
    let newBalance = 0;
    
    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          const expenseToDelete = card.expenses.find(e => e.id === expenseId);
          if (!expenseToDelete) return card;
          
          isShared = !!card.isShared;
          newBalance = card.balance + expenseToDelete.amount;
          
          return {
            ...card,
            balance: newBalance,
            expenses: card.expenses.filter(e => e.id !== expenseId)
          };
        }
        return card;
      });
    });

    if (isShared) {
      try {
        await this.supabase.removeExpense(cardId, expenseId, newBalance);
      } catch (e) {
        console.error('Failed to remove expense from Supabase', e);
      }
    }
  }

  private loadFromStorage(): GiftCard[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error loading from localStorage', err);
      return [];
    }
  }
}

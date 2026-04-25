import { Injectable, signal, effect, computed } from '@angular/core';
import { GiftCard, Expense } from '../models/gift-card.model';

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {
  private readonly STORAGE_KEY = 'gift_cards_data';
  
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

  addExpense(cardId: string, amount: number) {
    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          const id = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2) + Date.now().toString(36);
            
          const expense: Expense = {
            id,
            amount,
            date: Date.now()
          };
          return {
            ...card,
            balance: card.balance - amount,
            expenses: [expense, ...card.expenses]
          };
        }
        return card;
      });
    });
  }

  deleteExpense(cardId: string, expenseId: string) {
    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          const expenseToDelete = card.expenses.find(e => e.id === expenseId);
          if (!expenseToDelete) return card;
          
          return {
            ...card,
            balance: card.balance + expenseToDelete.amount,
            expenses: card.expenses.filter(e => e.id !== expenseId)
          };
        }
        return card;
      });
    });
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

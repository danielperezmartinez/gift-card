import { Injectable, signal, effect, computed, inject } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { GiftCard, Expense } from '../models/gift-card.model';
import { SupabaseService } from './supabase.service';
import { generateId } from './id';
import { logError } from './logger';

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {
  private readonly STORAGE_KEY = 'gift_cards_data';
  private supabase = inject(SupabaseService);
  private channels = new Map<string, RealtimeChannel>();

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
        logError('Error saving to localStorage', err);
      }
    });

    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    const cards = this._cards();
    for (const card of cards) {
      if (card.isShared) {
        if (!card.editToken) {
          this.claimLegacySharedCard(card.id);
        }
        this.syncSharedCard(card.id);
        this.subscribe(card.id);
      }
    }
  }

  private subscribe(id: string) {
    if (this.channels.has(id)) return;
    this.channels.set(
      id,
      this.supabase.subscribeToCardUpdates(id, () => {
        this.syncSharedCard(id);
      }),
    );
  }

  private unsubscribe(id: string) {
    const channel = this.channels.get(id);
    if (channel) {
      this.supabase.unsubscribe(channel);
      this.channels.delete(id);
    }
  }

  // Cards shared before edit tokens existed have no owner yet; the first device
  // that still holds them claims ownership.
  private async claimLegacySharedCard(id: string) {
    const editToken = this.generateEditToken();
    try {
      const claimed = await this.supabase.claimSharedCard(id, editToken);
      if (!claimed) {
        logError('Shared card could not be claimed; remote edits are disabled', id);
        return;
      }
      this.patchCard(id, { editToken });
    } catch (e) {
      logError('Failed to claim shared card', e);
    }
  }

  private generateEditToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private async syncSharedCard(id: string) {
    try {
      const remoteCard = await this.supabase.getSharedCard(id);
      if (remoteCard) {
        this.patchCard(id, {
          balance: remoteCard.balance,
          expenses: remoteCard.expenses,
          color: remoteCard.color,
          isShared: true,
        });
      }
    } catch (e) {
      logError('Failed to sync shared card', e);
    }
  }

  private patchCard(id: string, changes: Partial<GiftCard>) {
    this._cards.update(cards =>
      cards.map(card => (card.id === id ? { ...card, ...changes } : card)),
    );
  }

  async updateCardColor(cardId: string, color: string) {
    let isShared = false;
    let editToken: string | undefined;

    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          isShared = !!card.isShared;
          editToken = card.editToken;
          return { ...card, color };
        }
        return card;
      });
    });

    if (isShared) {
      try {
        await this.supabase.updateCardColor(cardId, this.requireEditToken(editToken), color);
      } catch (e) {
        logError('Failed to sync color to Supabase', e);
      }
    }
  }

  async shareCard(id: string) {
    const card = this._cards().find(c => c.id === id);
    if (!card) return;

    const editToken = this.generateEditToken();

    // Upload to Supabase first
    const balance = await this.supabase.shareCard(card, editToken);
    this.patchCard(id, { balance, isShared: true, editToken });

    // Subscribe to future updates
    this.subscribe(id);
  }

  // Removes the remote copy so the share link stops working; the card stays local.
  async unshareCard(id: string) {
    const card = this._cards().find(c => c.id === id);
    if (!card?.isShared) return;

    await this.supabase.deleteSharedCard(id, this.requireEditToken(card.editToken));
    this.unsubscribe(id);
    this.patchCard(id, { isShared: false, editToken: undefined });
  }

  getCardById(id: string) {
    return computed(() => this._cards().find(c => c.id === id));
  }

  addCard(name: string, description: string, initialAmount: number, color?: string) {
    const newCard: GiftCard = {
      id: generateId(),
      name,
      description,
      initialAmount,
      balance: initialAmount,
      expenses: [],
      createdAt: Date.now(),
      color
    };

    this._cards.update(cards => {
      const currentCards = Array.isArray(cards) ? cards : [];
      return [...currentCards, newCard];
    });
  }

  // A shared card owned by this device is deleted remotely first, so a local
  // delete never leaves a public copy behind. Throws if the remote delete fails.
  async deleteCard(id: string) {
    const card = this._cards().find(c => c.id === id);
    if (card?.isShared && card.editToken) {
      await this.supabase.deleteSharedCard(id, card.editToken);
    }
    this.unsubscribe(id);
    this._cards.update(cards => Array.isArray(cards) ? cards.filter(c => c.id !== id) : []);
  }

  async addExpense(cardId: string, amount: number) {
    const expense: Expense = {
      id: generateId(),
      amount,
      date: Date.now()
    };

    let isShared = false;
    let editToken: string | undefined;

    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          isShared = !!card.isShared;
          editToken = card.editToken;
          return {
            ...card,
            balance: card.balance - amount,
            expenses: [expense, ...card.expenses]
          };
        }
        return card;
      });
    });

    if (isShared) {
      try {
        // The server recalculates the balance; it wins over the optimistic one.
        const balance = await this.supabase.addExpense(cardId, this.requireEditToken(editToken), expense);
        this.patchCard(cardId, { balance });
      } catch (e) {
        logError('Failed to sync expense to Supabase', e);
        await this.syncSharedCard(cardId);
      }
    }
  }

  async deleteExpense(cardId: string, expenseId: string) {
    let isShared = false;
    let editToken: string | undefined;

    this._cards.update(cards => {
      if (!Array.isArray(cards)) return [];
      return cards.map(card => {
        if (card.id === cardId) {
          const expenseToDelete = card.expenses.find(e => e.id === expenseId);
          if (!expenseToDelete) return card;

          isShared = !!card.isShared;
          editToken = card.editToken;

          return {
            ...card,
            balance: card.balance + expenseToDelete.amount,
            expenses: card.expenses.filter(e => e.id !== expenseId)
          };
        }
        return card;
      });
    });

    if (isShared) {
      try {
        const balance = await this.supabase.removeExpense(cardId, this.requireEditToken(editToken), expenseId);
        this.patchCard(cardId, { balance });
      } catch (e) {
        logError('Failed to remove expense from Supabase', e);
        await this.syncSharedCard(cardId);
      }
    }
  }

  private requireEditToken(editToken: string | undefined): string {
    if (!editToken) {
      throw new Error('This device does not own the shared card');
    }
    return editToken;
  }

  private loadFromStorage(): GiftCard[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      logError('Error loading from localStorage', err);
      return [];
    }
  }
}

import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GiftCardService } from '../../services/gift-card.service';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CARD_COLORS, resolveCardColor } from '../../models/card-colors';
import { logError } from '../../services/logger';

@Component({
  selector: 'app-gift-card-detail',
  imports: [CommonModule, RouterLink, FormsModule, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (card(); as c) {
      <div class="container">
        <nav>
          <div class="nav-left">
            <a routerLink="/" class="back-link">
              <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver
            </a>
          </div>
          <div class="nav-right">
            <app-theme-toggle />
            @if (!c.isShared) {
              <button type="button" class="share-link" (click)="onShare()" [disabled]="isSharing()">
                {{ isSharing() ? 'Compartiendo...' : 'Compartir' }}
              </button>
            } @else {
              <button type="button" class="share-link" (click)="copyShareLink()">
                {{ copied() ? '¡Copiado!' : 'Copiar enlace' }}
              </button>
              @if (c.editToken) {
                <button type="button" class="share-link" (click)="onUnshare()" [disabled]="isSharing()">
                  Dejar de compartir
                </button>
              }
            }
            <button type="button" class="delete-link" (click)="onDeleteCard()">Eliminar</button>
            <span class="visually-hidden" aria-live="polite">{{ copied() ? 'Enlace copiado' : '' }}</span>
          </div>
        </nav>

        <div class="visual-card" [style.background]="cardColor()">
          <div class="card-glass"></div>
          <div class="card-header">
            <span class="chip">Gift Card</span>
            <div class="logo" aria-hidden="true">
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </div>
          <div class="card-body">
            <h1 class="card-name">{{ c.name }}</h1>
            <p class="card-desc">{{ c.description }}</p>
          </div>
          <div class="card-footer">
            <div class="balance-display">
              <span class="label">Saldo Disponible</span>
              <div class="amount-container">
                <span class="symbol">€</span>
                <span class="amount" [class.animating]="isAnimating()">{{ displayBalance().toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <section class="color-picker" aria-labelledby="color-picker-title">
          <h2 id="color-picker-title">Personalizar color</h2>
          <div class="colors-list" role="group" aria-labelledby="color-picker-title">
            @for (color of availableColors; track color.value) {
              <button
                type="button"
                class="color-btn"
                [style.background]="color.value"
                [class.selected]="color.value === cardColor()"
                [attr.aria-pressed]="color.value === cardColor()"
                [attr.aria-label]="color.label"
                (click)="onColorSelect(color.value)">
              </button>
            }
          </div>
        </section>

        <section class="expense-form" aria-labelledby="expense-form-title">
          <h2 id="expense-form-title">Añadir gasto</h2>
          <div class="input-group">
            <div class="input-wrapper">
              <label for="expense-amount" class="visually-hidden">Importe del gasto en euros</label>
              <span class="input-symbol" aria-hidden="true">€</span>
              <input id="expense-amount" type="number" inputmode="decimal" [(ngModel)]="expenseAmount" placeholder="0.00" step="0.01" min="0">
            </div>
            <button type="button" class="btn-primary" (click)="onAddExpense()" [disabled]="!expenseAmount || expenseAmount <= 0">
              Descontar
            </button>
          </div>
        </section>

        <section class="history">
          <div class="history-header">
            <h2>Historial de movimientos</h2>
            <span class="badge">{{ c.expenses.length }}<span class="visually-hidden"> movimientos</span></span>
          </div>

          <div class="history-list">
            @for (expense of c.expenses; track expense.id) {
              <div class="history-item">
                <div class="item-left">
                  <div class="icon-minus" aria-hidden="true">−</div>
                  <div class="item-info">
                    <span class="item-amount">{{ expense.amount | currency:'EUR' }}</span>
                    <span class="item-date">{{ expense.date | date:'short' }}</span>
                  </div>
                </div>
                <button type="button" class="remove-btn"
                  [attr.aria-label]="'Eliminar gasto de ' + (expense.amount | currency:'EUR')"
                  (click)="onRemoveExpense(expense.id)">
                  Eliminar
                </button>
              </div>
            } @empty {
              <p class="empty-history">No hay movimientos registrados.</p>
            }
          </div>
        </section>
      </div>
    } @else {
      <div class="error-state">
        <p>Tarjeta no encontrada</p>
        <a routerLink="/">Volver al inicio</a>
      </div>
    }
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; }
    
    nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .nav-right { display: flex; align-items: center; gap: 1rem; }
    .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; }
    .back-link:hover { color: var(--text); }
    .share-link { background: none; border: 1px solid var(--border); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); color: var(--text); font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .share-link:hover { background: var(--section-bg); }
    .share-link:disabled { opacity: 0.5; cursor: not-allowed; }
    .delete-link { background: none; border: none; color: var(--danger); font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    
    .visual-card {
      position: relative;
      aspect-ratio: 1.6/1;
      border-radius: var(--radius-xl);
      padding: 2rem;
      color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      margin-bottom: 3rem;
    }
    
    .card-glass {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .chip { background: rgba(0,0,0,0.2); padding: 0.4rem 0.8rem; border-radius: var(--radius-xs); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    
    .logo { display: flex; }
    .circle { width: 30px; height: 30px; border-radius: var(--radius-round); background: rgba(255,255,255,0.3); }
    .circle:last-child { margin-left: -15px; background: rgba(255,255,255,0.2); }
    
    .card-name { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
    .card-desc { font-size: 1rem; margin: 0.25rem 0 0; }
    
    .balance-display .label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .amount-container { display: flex; align-items: baseline; gap: 0.4rem; margin-top: 0.2rem; }
    .symbol { font-size: 1.5rem; font-weight: 700; opacity: 0.8; }
    .amount { font-size: 3rem; font-weight: 800; line-height: 1; }
    .amount.animating { transform: scale(1.05); color: #fff; }
    
    .color-picker { background: var(--section-bg); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); margin-bottom: 2.5rem; }
    .color-picker h2 { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 700; color: var(--text); }
    .colors-list { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .color-btn { width: 36px; height: 36px; border-radius: var(--radius-round); border: 2px solid transparent; cursor: pointer; transition: transform 0.2s, border-color 0.2s; padding: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .color-btn:hover { transform: scale(1.1); }
    .color-btn.selected { border-color: var(--text); transform: scale(1.15); box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text); }
    
    .expense-form { background: var(--section-bg); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); margin-bottom: 2.5rem; }
    .expense-form h2 { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 700; color: var(--text); }
    
    .input-group { display: flex; gap: 1rem; }
    .input-wrapper { flex: 1; position: relative; }
    .input-symbol { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-weight: 600; }
    .input-wrapper input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.2rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); font-size: 1.1rem; font-weight: 600; background: var(--input-bg); color: var(--text); }
    
    .btn-primary { background: var(--primary); color: var(--on-primary); border: none; padding: 0 1.5rem; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .history-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .history-header h2 { margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text); }
    .badge { background: var(--border); padding: 0.2rem 0.6rem; border-radius: var(--radius-lg); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
    
    .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .history-item { 
      display: flex; justify-content: space-between; align-items: center; padding: 1rem; 
      background: var(--history-item-bg); border-radius: var(--radius-md); border: 1px solid var(--border); transition: all 0.2s; 
    }
    .history-item:hover { background: var(--border); }
    
    .item-left { display: flex; align-items: center; gap: 1rem; }
    .icon-minus { width: 32px; height: 32px; border-radius: var(--radius-round); background: var(--danger-soft); color: var(--danger); display: grid; place-items: center; font-weight: 800; }
    
    .item-info { display: flex; flex-direction: column; }
    .item-amount { font-weight: 700; color: var(--text); font-size: 1.05rem; }
    .item-date { font-size: 0.8rem; color: var(--text-secondary); }
    
    .remove-btn { background: none; border: none; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: color 0.2s; }
    .remove-btn:hover { color: var(--danger); }
    
    .empty-history { text-align: center; color: var(--text-secondary); padding: 2rem; font-style: italic; }
    
    .error-state { text-align: center; padding: 4rem 2rem; }
    .error-state p { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--text); }
    .error-state a { color: var(--primary); font-weight: 600; }
  `]
})
export class GiftCardDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private giftCardService = inject(GiftCardService);

  cardId = signal<string | null>(null);
  card = computed(() => {
    const id = this.cardId();
    return id ? this.giftCardService.getCardById(id)() : null;
  });

  expenseAmount: number | null = null;
  
  // Animation state
  displayBalance = signal(0);
  isAnimating = signal(false);
  private animationInterval: any;

  readonly availableColors = CARD_COLORS;

  cardColor = computed(() => resolveCardColor(this.card()));

  // Share state
  isSharing = signal(false);
  copied = signal(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.cardId.set(id);
      const initialCard = this.card();
      if (initialCard) {
        this.displayBalance.set(initialCard.balance);
      }
    });

    effect(() => {
      const targetBalance = this.card()?.balance ?? 0;
      this.animateTo(targetBalance);
    });
  }

  onColorSelect(color: string) {
    if (this.cardId()) {
      this.giftCardService.updateCardColor(this.cardId()!, color);
    }
  }

  private animateTo(target: number) {
    if (this.displayBalance() === target) return;
    
    this.isAnimating.set(true);
    if (this.animationInterval) clearInterval(this.animationInterval);

    const start = this.displayBalance();
    const duration = 800;
    const startTime = Date.now();

    this.animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (target - start) * easeProgress;
      this.displayBalance.set(current);
      if (progress === 1) {
        clearInterval(this.animationInterval);
        this.isAnimating.set(false);
      }
    }, 16);
  }

  onAddExpense() {
    if (this.expenseAmount && this.expenseAmount > 0 && this.cardId()) {
      this.giftCardService.addExpense(this.cardId()!, this.expenseAmount);
      this.expenseAmount = null;
    }
  }

  onRemoveExpense(expenseId: string) {
    if (this.cardId()) {
      this.giftCardService.deleteExpense(this.cardId()!, expenseId);
    }
  }

  async onDeleteCard() {
    const id = this.cardId();
    if (!id) return;
    const message = this.card()?.isShared
      ? '¿Eliminar esta tarjeta por completo? También dejará de estar compartida y su enlace dejará de funcionar.'
      : '¿Estás seguro de que quieres eliminar esta tarjeta por completo?';
    if (!confirm(message)) return;

    try {
      await this.giftCardService.deleteCard(id);
      this.router.navigate(['/']);
    } catch (e) {
      logError('Failed to delete card', e);
      alert('No se pudo eliminar la copia compartida. Inténtalo de nuevo.');
    }
  }

  async onUnshare() {
    const id = this.cardId();
    if (!id || this.isSharing()) return;
    if (!confirm('¿Dejar de compartir esta tarjeta? El enlace dejará de funcionar; la tarjeta seguirá en este dispositivo.')) return;

    this.isSharing.set(true);
    try {
      await this.giftCardService.unshareCard(id);
    } catch (e) {
      logError('Failed to unshare card', e);
      alert('No se pudo dejar de compartir la tarjeta. Inténtalo de nuevo.');
    } finally {
      this.isSharing.set(false);
    }
  }

  async onShare() {
    if (this.isSharing() || !this.cardId()) return;
    this.isSharing.set(true);
    try {
      await this.giftCardService.shareCard(this.cardId()!);
      this.copyShareLink();
    } catch (e) {
      logError('Failed to share card', e);
      alert('Hubo un error al compartir la tarjeta. Inténtalo de nuevo.');
    } finally {
      this.isSharing.set(false);
    }
  }

  copyShareLink() {
    if (!this.cardId()) return;
    
    const url = window.location.origin + '/shared/' + this.cardId();
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }).catch(err => {
      logError('Failed to copy share link', err);
      prompt('Copia este enlace para compartir:', url);
    });
  }
}

import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GiftCardService } from '../../services/gift-card.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gift-card-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (card(); as c) {
      <div class="container">
        <nav>
          <a routerLink="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver
          </a>
          <button class="delete-link" (click)="onDeleteCard()">Eliminar tarjeta</button>
        </nav>

        <div class="visual-card" [style.background]="cardColor()">
          <div class="card-glass"></div>
          <div class="card-header">
            <span class="chip">Gift Card</span>
            <div class="logo">
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </div>
          <div class="card-body">
            <h2 class="card-name">{{ c.name }}</h2>
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

        <section class="expense-form">
          <h3>Añadir Gasto</h3>
          <div class="input-group">
            <div class="input-wrapper">
              <span class="input-symbol">€</span>
              <input type="number" [(ngModel)]="expenseAmount" placeholder="0.00" step="0.01" min="0">
            </div>
            <button class="btn-primary" (click)="onAddExpense()" [disabled]="!expenseAmount || expenseAmount <= 0">
              Descontar
            </button>
          </div>
        </section>

        <section class="history">
          <div class="history-header">
            <h3>Historial de Movimientos</h3>
            <span class="badge">{{ c.expenses.length }}</span>
          </div>
          
          <div class="history-list">
            @for (expense of c.expenses; track expense.id) {
              <div class="history-item">
                <div class="item-left">
                  <div class="icon-minus">−</div>
                  <div class="item-info">
                    <span class="item-amount">{{ expense.amount | currency:'EUR' }}</span>
                    <span class="item-date">{{ expense.date | date:'short' }}</span>
                  </div>
                </div>
                <button class="remove-btn" (click)="onRemoveExpense(expense.id)">
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
    .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; }
    .back-link:hover { color: var(--text); }
    .delete-link { background: none; border: none; color: #FF3B30; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    
    .visual-card {
      position: relative;
      aspect-ratio: 1.6/1;
      border-radius: 24px;
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
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .chip { background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    
    .logo { display: flex; }
    .circle { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.3); }
    .circle:last-child { margin-left: -15px; background: rgba(255,255,255,0.2); }
    
    .card-name { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
    .card-desc { font-size: 1rem; opacity: 0.8; margin: 0.25rem 0 0; }
    
    .balance-display .label { font-size: 0.8rem; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
    .amount-container { display: flex; align-items: baseline; gap: 0.4rem; margin-top: 0.2rem; }
    .symbol { font-size: 1.5rem; font-weight: 700; opacity: 0.8; }
    .amount { font-size: 3rem; font-weight: 800; line-height: 1; }
    .amount.animating { transform: scale(1.05); color: #fff; }
    
    .expense-form { background: var(--section-bg); padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border); margin-bottom: 2.5rem; }
    .expense-form h3 { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 700; color: var(--text); }
    
    .input-group { display: flex; gap: 1rem; }
    .input-wrapper { flex: 1; position: relative; }
    .input-symbol { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-weight: 600; }
    .input-wrapper input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.2rem; border-radius: 12px; border: 1.5px solid var(--border); font-size: 1.1rem; font-weight: 600; background: var(--input-bg); color: var(--text); }
    
    .btn-primary { background: var(--primary); color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .history-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .history-header h3 { margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text); }
    .badge { background: var(--border); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
    
    .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .history-item { 
      display: flex; justify-content: space-between; align-items: center; padding: 1rem; 
      background: var(--history-item-bg); border-radius: 16px; border: 1px solid var(--border); transition: all 0.2s; 
    }
    .history-item:hover { background: var(--border); }
    
    .item-left { display: flex; align-items: center; gap: 1rem; }
    .icon-minus { width: 32px; height: 32px; border-radius: 50%; background: #FF3B301A; color: #FF3B30; display: grid; place-items: center; font-weight: 800; }
    
    .item-info { display: flex; flex-direction: column; }
    .item-amount { font-weight: 700; color: var(--text); font-size: 1.05rem; }
    .item-date { font-size: 0.8rem; color: var(--text-secondary); }
    
    .remove-btn { background: none; border: none; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: color 0.2s; }
    .remove-btn:hover { color: #FF3B30; }
    
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

  // Aesthetic choices
  cardColor = computed(() => {
    const card = this.card();
    if (card?.color) return card.color;
    
    const name = card?.name || '';
    const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

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

  onDeleteCard() {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta por completo?')) {
      this.giftCardService.deleteCard(this.cardId()!);
      this.router.navigate(['/']);
    }
  }
}

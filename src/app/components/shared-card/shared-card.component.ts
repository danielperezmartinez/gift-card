import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { GiftCard, Expense } from '../../models/gift-card.model';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-shared-card',
  imports: [CommonModule, RouterLink, FormsModule, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <p>Cargando tarjeta compartida...</p>
      </div>
    } @else if (card(); as c) {
      <div class="container">
        <nav>
          <div class="nav-left">
            <!-- No back button to local list since they are a guest -->
            <span class="guest-badge">Modo Invitado</span>
          </div>
          <div class="nav-right">
            <app-theme-toggle />
          </div>
        </nav>

        <div class="visual-card" [style.background]="cardColor()">
          <div class="card-glass"></div>
          <div class="card-header">
            <span class="chip">Gift Card Compartida</span>
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
              </div>
            } @empty {
              <p class="empty-history">No hay movimientos registrados.</p>
            }
          </div>
        </section>
      </div>
    } @else {
      <div class="error-state">
        <p>Tarjeta no encontrada o no disponible</p>
        <a routerLink="/">Ir a la página principal</a>
      </div>
    }
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; }
    
    nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .nav-right { display: flex; align-items: center; gap: 1rem; }
    .guest-badge { background: var(--primary); color: white; padding: 0.3rem 0.8rem; border-radius: var(--radius-xl); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
    
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
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .chip { background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: var(--radius-xs); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    
    .logo { display: flex; }
    .circle { width: 30px; height: 30px; border-radius: var(--radius-round); background: rgba(255,255,255,0.3); }
    .circle:last-child { margin-left: -15px; background: rgba(255,255,255,0.2); }
    
    .card-name { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
    .card-desc { font-size: 1rem; opacity: 0.8; margin: 0.25rem 0 0; }
    
    .balance-display .label { font-size: 0.8rem; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
    .amount-container { display: flex; align-items: baseline; gap: 0.4rem; margin-top: 0.2rem; }
    .symbol { font-size: 1.5rem; font-weight: 700; opacity: 0.8; }
    .amount { font-size: 3rem; font-weight: 800; line-height: 1; }
    .amount.animating { transform: scale(1.05); color: #fff; }
    
    .history-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .history-header h3 { margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text); }
    .badge { background: var(--border); padding: 0.2rem 0.6rem; border-radius: var(--radius-lg); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
    
    .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .history-item { 
      display: flex; justify-content: space-between; align-items: center; padding: 1rem; 
      background: var(--history-item-bg); border-radius: var(--radius-md); border: 1px solid var(--border); transition: all 0.2s; 
    }
    .history-item:hover { background: var(--border); }
    
    .item-left { display: flex; align-items: center; gap: 1rem; }
    .icon-minus { width: 32px; height: 32px; border-radius: var(--radius-round); background: #FF3B301A; color: #FF3B30; display: grid; place-items: center; font-weight: 800; }
    
    .item-info { display: flex; flex-direction: column; }
    .item-amount { font-weight: 700; color: var(--text); font-size: 1.05rem; }
    .item-date { font-size: 0.8rem; color: var(--text-secondary); }
    
    .empty-history { text-align: center; color: var(--text-secondary); padding: 2rem; font-style: italic; }
    
    .error-state, .loading-state { text-align: center; padding: 4rem 2rem; }
    .error-state p, .loading-state p { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--text); }
    .error-state a { color: var(--primary); font-weight: 600; }
  `]
})
export class SharedCardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  cardId = signal<string | null>(null);
  card = signal<GiftCard | null>(null);
  isLoading = signal(true);
  
  // Animation state
  displayBalance = signal(0);
  isAnimating = signal(false);
  private animationInterval: any;
  private channel: any;

  // Aesthetic choices
  cardColor = computed(() => {
    const c = this.card();
    if (c?.color) return c.color;
    
    const name = c?.name || '';
    const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

  constructor() {
    effect(() => {
      const targetBalance = this.card()?.balance ?? 0;
      this.animateTo(targetBalance);
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.cardId.set(id);
      if (id) {
        this.loadCard(id);
        this.channel = this.supabaseService.subscribeToCardUpdates(id, () => {
          this.loadCard(id);
        });
      } else {
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.channel) {
      this.supabaseService.unsubscribe(this.channel);
    }
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  async loadCard(id: string) {
    try {
      const fetchedCard = await this.supabaseService.getSharedCard(id);
      if (fetchedCard && !this.card()) {
        this.displayBalance.set(fetchedCard.balance);
      }
      this.card.set(fetchedCard);
    } catch (e) {
      console.error('Error fetching shared card:', e);
    } finally {
      this.isLoading.set(false);
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
}

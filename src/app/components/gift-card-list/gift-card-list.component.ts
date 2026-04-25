import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GiftCardService } from '../../services/gift-card.service';
import { GiftCardFormComponent } from '../gift-card-form/gift-card-form.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-gift-card-list',
  imports: [CommonModule, RouterLink, GiftCardFormComponent, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <header>
        <div class="header-top">
          <h1>Mis Tarjetas</h1>
          <app-theme-toggle />
        </div>
        <p>Gestiona tus saldos fácilmente</p>
      </header>

      <div class="list">
        @for (card of giftCardService.cards(); track card.id) {
          <div class="card-item" [routerLink]="['/card', card.id]">
            <div class="card-accent" [style.background-color]="getCardColor(card)"></div>
            <div class="card-info">
              <h3>{{ card.name }}</h3>
              <p>{{ card.description }}</p>
            </div>
            <div class="card-balance">
              <span class="label">Saldo</span>
              <span class="value">{{ card.balance | currency:'EUR' }}</span>
            </div>
            <button class="delete-btn" (click)="$event.stopPropagation(); onDelete(card.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        } @empty {
          <div class="empty-state">
            <div class="icon">🎁</div>
            <p>Aún no tienes tarjetas de regalo.</p>
            <p class="sub">Pulsa el botón "+" para añadir una.</p>
          </div>
        }
      </div>

      <button class="fab" (click)="showForm.set(true)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fab-icon)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      @if (showForm()) {
        <app-gift-card-form 
          (close)="showForm.set(false)" 
          (create)="onAddCard($event)"
        />
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem 1.5rem 6rem;
    }
    
    header { margin-bottom: 2.5rem; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--text); letter-spacing: -0.02em; }
    header p { color: var(--text-secondary); font-size: 1.1rem; }
    
    .list { display: flex; flex-direction: column; gap: 1rem; }
    
    .card-item {
      background: var(--card-bg);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    
    .card-item:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      border-color: var(--primary);
    }

    .card-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6px;
    }
    
    .card-info h3 { margin: 0 0 0.25rem; font-size: 1.2rem; font-weight: 700; color: var(--text); }
    .card-info p { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
    
    .card-balance { text-align: right; margin-right: 2.5rem; }
    .card-balance .label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.1rem; }
    .card-balance .value { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
    
    .delete-btn {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: #FF3B301A;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      color: #FF3B30;
      opacity: 0;
      transition: all 0.2s;
    }
    
    .card-item:hover .delete-btn { opacity: 1; }
    .delete-btn:hover { background: #FF3B30; color: white; }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--section-bg);
      border-radius: 24px;
      border: 2px dashed var(--border);
    }
    
    .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state p { margin: 0; font-weight: 600; color: var(--text); }
    .empty-state .sub { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem; }
    
    .fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--fab-bg);
      border: none;
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 100;
    }
    
    .fab:hover { transform: scale(1.1) rotate(90deg); background: var(--primary); }
    .fab:active { transform: scale(0.95); }
  `]
})
export class GiftCardListComponent {
  giftCardService = inject(GiftCardService);
  showForm = signal(false);

  getCardColor(card: any) {
    if (card.color) return card.color;
    const name = card.name || '';
    const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  onAddCard(data: { name: string, description: string, amount: number, color?: string }) {
    this.giftCardService.addCard(data.name, data.description, data.amount, data.color);
    this.showForm.set(false);
  }

  onDelete(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      this.giftCardService.deleteCard(id);
    }
  }
}

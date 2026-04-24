import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift-card-form',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Nueva Tarjeta</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre de la tarjeta</label>
            <input id="name" type="text" formControlName="name" placeholder="Ej. Amazon, Netflix...">
          </div>
          
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" formControlName="description" placeholder="Añade una nota..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="amount">Importe inicial (€)</label>
            <input id="amount" type="number" formControlName="amount" step="0.01">
          </div>
          
          <div class="actions">
            <button type="button" class="btn-secondary" (click)="close.emit()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">Crear Tarjeta</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: var(--modal-overlay);
      backdrop-filter: blur(8px);
      display: grid;
      place-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    }
    
    .modal-content {
      background: var(--glass-bg);
      padding: 2rem;
      border-radius: 24px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid var(--border);
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: var(--text);
    }
    
    h2 { margin-top: 0; font-weight: 700; color: var(--text); }
    
    .form-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); }
    
    input, textarea {
      padding: 0.8rem 1rem;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    button {
      flex: 1;
      padding: 0.8rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-2px);
    }
    
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: var(--border);
      color: var(--text);
    }
    
    .btn-secondary:hover { opacity: 0.8; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class GiftCardFormComponent {
  private fb = inject(FormBuilder);
  
  close = output<void>();
  create = output<{ name: string, description: string, amount: number }>();

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      this.create.emit({
        name: val.name!,
        description: val.description!,
        amount: val.amount!
      });
      this.form.reset();
    }
  }
}

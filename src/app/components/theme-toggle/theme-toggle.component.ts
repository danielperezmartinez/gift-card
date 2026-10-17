import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="toggle-btn" (click)="themeService.toggleTheme()" [attr.aria-label]="themeService.darkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
      <div class="icon-container" [class.is-dark]="themeService.darkMode()">
        <svg aria-hidden="true" focusable="false" class="sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg aria-hidden="true" focusable="false" class="moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </div>
    </button>
  `,
  styles: [`
    .toggle-btn {
      background: var(--section-bg);
      border: 1px solid var(--border);
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: var(--text);
    }
    
    .icon-container {
      position: relative;
      width: 20px;
      height: 20px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    .sun, .moon {
      position: absolute;
      inset: 0;
      transition: opacity 0.3s, transform 0.5s;
    }
    
    .moon { opacity: 0; transform: rotate(-90deg) scale(0); }
    
    .icon-container.is-dark .sun { opacity: 0; transform: rotate(90deg) scale(0); }
    .icon-container.is-dark .moon { opacity: 1; transform: rotate(0) scale(1); }

    .toggle-btn:hover {
      background: var(--border);
      transform: translateY(-2px);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}

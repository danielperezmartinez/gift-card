import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'gift_card_theme';
  
  // Initialize from storage or system preference
  private readonly _darkMode = signal<boolean>(this.loadFromStorage());
  readonly darkMode = this._darkMode.asReadonly();

  constructor() {
    // Apply theme to document body and persist to storage
    effect(() => {
      const isDark = this._darkMode();
      if (isDark) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.style.colorScheme = 'light';
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(isDark));
    });
  }

  toggleTheme() {
    document.body.classList.add('theme-transition');
    this._darkMode.update(v => !v);
    
    // Remove the transition class after the animation completes
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 350); // slightly more than the 0.3s CSS transition
  }

  private loadFromStorage(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading theme from storage', e);
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}

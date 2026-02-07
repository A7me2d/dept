import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Signal for current theme
  readonly isDark = signal<boolean>(false);
  
  constructor() {
    // Load theme from localStorage on init
    this.loadTheme();
    
    // Apply theme whenever it changes
    effect(() => {
      this.applyTheme(this.isDark());
    });
  }
  
  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    this.isDark.set(!this.isDark());
    this.saveTheme();
  }
  
  /**
   * Set theme explicitly
   */
  setTheme(isDark: boolean): void {
    this.isDark.set(isDark);
    this.saveTheme();
  }
  
  /**
   * Load theme from localStorage
   */
  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDark.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(prefersDark);
    }
  }
  
  /**
   * Save theme to localStorage
   */
  private saveTheme(): void {
    localStorage.setItem(this.THEME_KEY, this.isDark() ? 'dark' : 'light');
  }
  
  /**
   * Apply theme to document
   */
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}

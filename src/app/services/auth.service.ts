import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);

  private readonly _currentUser = signal<any>(null);
  private readonly _sessionChecked = signal(false);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly sessionChecked = this._sessionChecked.asReadonly();

  constructor() {
    this.checkSession();
    this.setupAuthListener();
  }

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.signIn(email, password);
    
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    if (data.user) {
      this._currentUser.set(data.user);
      return true;
    }

    return false;
  }

  async signUp(email: string, password: string, name?: string): Promise<boolean> {
    const { data, error } = await this.supabase.signUp(email, password, name);
    
    if (error) {
      console.error('Sign up error:', error.message);
      return false;
    }

    if (data.user) {
      this._currentUser.set(data.user);
      return true;
    }

    return false;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    this._currentUser.set(null);
    await this.router.navigate(['/login']);
  }

  private async checkSession(): Promise<void> {
    const { session } = await this.supabase.getSession();
    if (session?.user) {
      this._currentUser.set(session.user);
    }
    this._sessionChecked.set(true);
  }

  private setupAuthListener(): void {
    this.supabase.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this._currentUser.set(session.user);
      } else if (event === 'SIGNED_OUT') {
        this._currentUser.set(null);
      }
    });
  }
}

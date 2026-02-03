import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { db } from './database.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _currentUser = signal<string | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    this.checkSession();
  }

  async login(username: string, password: string): Promise<boolean> {
    const hashedPassword = this.hashPassword(password);
    let user = await db.users
      .where('username')
      .equals(username)
      .first();

    // Create default user if not exists (for first-time setup)
    if (!user && username === 'Ahmed') {
      await db.users.add({
        username: 'Ahmed',
        password: this.hashPassword('Ahmed123')
      });
      user = await db.users
        .where('username')
        .equals(username)
        .first();
    }

    if (user && user.password === hashedPassword) {
      this._currentUser.set(username);
      localStorage.setItem('auth_user', username);
      return true;
    }

    return false;
  }

  async logout(): Promise<void> {
    this._currentUser.set(null);
    localStorage.removeItem('auth_user');
    await this.router.navigate(['/login']);
  }

  private checkSession(): void {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      this._currentUser.set(savedUser);
    }
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

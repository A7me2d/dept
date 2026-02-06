import { Injectable, signal, inject } from '@angular/core';
import { Settings } from '../models/settings.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  dailyLimit: 0,
  weeklyLimit: 0,
  currency: 'ج.م',
  updatedAt: new Date().toISOString()
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly settings = signal<Settings>({
    id: '',
    dailyLimit: DEFAULT_SETTINGS.dailyLimit,
    weeklyLimit: DEFAULT_SETTINGS.weeklyLimit,
    currency: DEFAULT_SETTINGS.currency,
    updatedAt: new Date().toISOString()
  });

  async load() {
    this.loading.set(true);
    try {
      const userId = this.auth.currentUser()?.id;
      if (!userId) return;

      const { data, error } = await this.supabase.client
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default
        await this.createDefault(userId);
      } else if (data) {
        this.settings.set({
          id: data.id,
          dailyLimit: data.daily_limit,
          weeklyLimit: data.weekly_limit,
          currency: data.currency,
          updatedAt: data.updated_at
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async createDefault(userId: string) {
    const { data, error } = await this.supabase.client
      .from('user_settings')
      .insert({
        user_id: userId,
        daily_limit: DEFAULT_SETTINGS.dailyLimit,
        weekly_limit: DEFAULT_SETTINGS.weeklyLimit,
        currency: DEFAULT_SETTINGS.currency
      })
      .select()
      .single();

    if (data) {
      this.settings.set({
        id: data.id,
        dailyLimit: data.daily_limit,
        weeklyLimit: data.weekly_limit,
        currency: data.currency,
        updatedAt: data.updated_at
      });
    }
  }

  async update(patch: Partial<Omit<Settings, 'id'>>) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await this.supabase.client
      .from('user_settings')
      .update({
        daily_limit: patch.dailyLimit,
        weekly_limit: patch.weeklyLimit,
        currency: patch.currency
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      this.settings.set({
        id: data.id,
        dailyLimit: data.daily_limit,
        weeklyLimit: data.weekly_limit,
        currency: data.currency,
        updatedAt: data.updated_at
      });
    }

    return this.settings();
  }
}

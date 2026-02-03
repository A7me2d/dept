import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../models/settings.model';

const API_URL = 'https://66cb41954290b1c4f199e054.mockapi.io/sitting';

const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  dailyLimit: 500,
  weeklyLimit: 3000,
  alertsEnabled: true,
  updatedAt: new Date().toISOString()
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly loading = signal(false);
  readonly settings = signal<Settings>(DEFAULT_SETTINGS);

  constructor(private http: HttpClient) {
    void this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const items = await this.http.get<Settings[]>(API_URL).toPromise();
      if (items && items.length > 0) {
        this.settings.set(items[0]);
      } else {
        const created = await this.http.post<Settings>(API_URL, DEFAULT_SETTINGS).toPromise();
        this.settings.set(created || DEFAULT_SETTINGS);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async update(patch: Partial<Omit<Settings, 'id'>>) {
    const next: Settings = {
      ...this.settings(),
      ...patch,
      updatedAt: new Date().toISOString()
    };

    await this.http.put(`${API_URL}/${next.id}`, next).toPromise();
    this.settings.set(next);

    return next;
  }
}

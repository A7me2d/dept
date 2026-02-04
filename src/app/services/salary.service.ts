import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Salary, NewSalaryInput, UpdateSalaryInput } from '../models/salary.model';
import { SettingsService } from './settings.service';
import { format } from 'date-fns';

const API_URL = 'https://66cb41954290b1c4f199e054.mockapi.io/sitting';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(SettingsService);

  readonly loading = computed(() => this.settings.loading());
  readonly salaries = computed(() => this.settings.settings().salaries);

  readonly totalSalary = computed(() => {
    return this.salaries().reduce((sum, s) => sum + s.amount, 0);
  });

  readonly salariesByMonth = computed(() => {
    const grouped = new Map<string, Salary[]>();
    
    for (const salary of this.salaries()) {
      const existing = grouped.get(salary.month) || [];
      existing.push(salary);
      grouped.set(salary.month, existing);
    }

    return Array.from(grouped.entries())
      .map(([month, salaries]) => ({ month, salaries, total: salaries.reduce((sum, s) => sum + s.amount, 0) }))
      .sort((a, b) => b.month.localeCompare(a.month));
  });

  async add(input: NewSalaryInput) {
    const now = new Date();
    const salary: Salary = {
      id: crypto.randomUUID(),
      amount: input.amount,
      month: input.month,
      notes: input.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const currentSettings = this.settings.settings();
    const updatedSettings = {
      ...currentSettings,
      salaries: [...currentSettings.salaries, salary],
      updatedAt: now.toISOString()
    };

    await this.http.put(`${API_URL}/settings`, updatedSettings).toPromise();
    this.settings.settings.set(updatedSettings);
    return salary;
  }

  async update(input: UpdateSalaryInput) {
    const currentSettings = this.settings.settings();
    const existing = currentSettings.salaries.find((s) => s.id === input.id);
    if (!existing) return null;

    const nowIso = new Date().toISOString();
    const updated: Salary = {
      ...existing,
      ...input,
      updatedAt: nowIso
    };

    const updatedSettings = {
      ...currentSettings,
      salaries: currentSettings.salaries.map((s) => (s.id === input.id ? updated : s)),
      updatedAt: nowIso
    };

    await this.http.put(`${API_URL}/settings`, updatedSettings).toPromise();
    this.settings.settings.set(updatedSettings);
    return updated;
  }

  async remove(id: string) {
    const currentSettings = this.settings.settings();
    const updatedSettings = {
      ...currentSettings,
      salaries: currentSettings.salaries.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString()
    };

    await this.http.put(`${API_URL}/settings`, updatedSettings).toPromise();
    this.settings.settings.set(updatedSettings);
  }

  async getById(id: string) {
    return this.salaries().find((s) => s.id === id) || null;
  }

  getSalaryByMonth(month: string) {
    return computed(() =>
      this.salaries().filter((s) => s.month === month)
    );
  }

  getTotalByMonth(month: string) {
    return computed(() => {
      return this.getSalaryByMonth(month)().reduce((sum, s) => sum + s.amount, 0);
    });
  }

  getCurrentMonth() {
    return format(new Date(), 'yyyy-MM');
  }

  getAllMonths() {
    return computed(() => {
      const months = new Set(this.salaries().map((s) => s.month));
      return Array.from(months).sort((a, b) => b.localeCompare(a));
    });
  }
}

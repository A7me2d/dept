import { Injectable, computed, signal, inject } from '@angular/core';
import { Salary, NewSalaryInput, UpdateSalaryInput } from '../models/salary.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { format } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly salaries = signal<Salary[]>([]);

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

  async refresh() {
    this.loading.set(true);
    try {
      const userId = this.auth.currentUser()?.id;
      if (!userId) {
        this.salaries.set([]);
        return;
      }

      const { data, error } = await this.supabase.client
        .from('salaries')
        .select('*')
        .eq('user_id', userId)
        .order('month', { ascending: false });

      if (error) throw error;
      this.salaries.set(data || []);
    } finally {
      this.loading.set(false);
    }
  }

  async add(input: NewSalaryInput) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const now = new Date();
    const salary: Salary = {
      id: crypto.randomUUID(),
      amount: input.amount,
      month: input.month,
      notes: input.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const { data, error } = await this.supabase.client
      .from('salaries')
      .insert({
        user_id: userId,
        amount: salary.amount,
        month: salary.month,
        notes: salary.notes
      })
      .select()
      .single();

    if (error) throw error;
    await this.refresh();
    return data;
  }

  async update(input: UpdateSalaryInput) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await this.supabase.client
      .from('salaries')
      .update({
        amount: input.amount,
        month: input.month,
        notes: input.notes
      })
      .eq('id', input.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    await this.refresh();
    return data;
  }

  async remove(id: string) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await this.supabase.client
      .from('salaries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    await this.refresh();
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.client
      .from('salaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
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

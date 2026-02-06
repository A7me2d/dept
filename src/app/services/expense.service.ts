import { Injectable, computed, signal, inject } from '@angular/core';
import { format } from 'date-fns';
import { Expense, NewExpenseInput, UpdateExpenseInput } from '../models/expense.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly expenses = signal<Expense[]>([]);

  readonly groupedDailyTotals = computed(() => {
    const totals = new Map<string, number>();

    for (const e of this.expenses()) {
      if (e.archived) continue;
      totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);
    }

    return Array.from(totals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  async refresh() {
    this.loading.set(true);
    try {
      const userId = this.auth.currentUser()?.id;
      if (!userId) {
        this.expenses.set([]);
        return;
      }

      const { data, error } = await this.supabase.client
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      this.expenses.set(data || []);
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.client
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  expensesByDate(date: string) {
    return computed(() =>
      this.expenses()
        .filter((e) => e.date === date && !e.archived)
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  }

  totalByDate(date: string) {
    return computed(() => this.expensesByDate(date)().reduce((sum, e) => sum + e.amount, 0));
  }

  async add(input: NewExpenseInput) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const now = new Date();
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date,
      time: input.time,
      paymentMethod: input.paymentMethod,
      archived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const { data, error } = await this.supabase.client
      .from('expenses')
      .insert({
        user_id: userId,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        time: expense.time,
        payment_method: expense.paymentMethod,
        archived: false
      })
      .select()
      .single();

    if (error) throw error;
    await this.refresh();
    return data;
  }

  async update(input: UpdateExpenseInput) {
    const userId = this.auth.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await this.supabase.client
      .from('expenses')
      .update({
        amount: input.amount,
        category: input.category,
        description: input.description,
        date: input.date,
        time: input.time,
        payment_method: input.paymentMethod,
        archived: input.archived
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
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    await this.refresh();
  }

  async archive(id: string) {
    await this.update({ id, archived: true });
  }

  createDefaultsForNow(partial?: Partial<NewExpenseInput>): NewExpenseInput {
    const now = new Date();
    return {
      amount: partial?.amount ?? 0,
      category: partial?.category ?? 'أخرى',
      description: partial?.description ?? '',
      date: partial?.date ?? format(now, 'yyyy-MM-dd'),
      time: partial?.time ?? format(now, 'HH:mm'),
      paymentMethod: partial?.paymentMethod ?? 'cash'
    };
  }
}

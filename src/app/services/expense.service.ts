import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { format } from 'date-fns';
import { Expense, NewExpenseInput, UpdateExpenseInput } from '../models/expense.model';

const API_URL = 'https://66cb41954290b1c4f199e054.mockapi.io/data';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
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

  constructor(private http: HttpClient) {
    void this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      const items = await this.http.get<Expense[]>(API_URL).toPromise();
      this.expenses.set(items || []);
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string) {
    const items = await this.http.get<Expense>(`${API_URL}/${id}`).toPromise();
    return items || null;
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

    const created = await this.http.post<Expense>(API_URL, expense).toPromise();
    if (created) {
      await this.refresh();
      return created;
    }
    return expense;
  }

  async update(input: UpdateExpenseInput) {
    const existing = await this.getById(input.id);
    if (!existing) return null;

    const nowIso = new Date().toISOString();
    const updated: Expense = {
      ...existing,
      ...input,
      updatedAt: nowIso
    };

    await this.http.put(`${API_URL}/${input.id}`, updated).toPromise();
    await this.refresh();

    return updated;
  }

  async remove(id: string) {
    await this.http.delete(`${API_URL}/${id}`).toPromise();
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

import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseService } from '../services/expense.service';
import { SettingsService } from '../services/settings.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { SalaryService } from '../services/salary.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DecimalPipe, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly expenses = inject(ExpenseService);
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly salaryService = inject(SalaryService);

  private readonly now = new Date();

  constructor() {
    this.loadData();
  }

  private async loadData() {
    await Promise.all([
      this.expenses.refresh(),
      this.salaryService.refresh(),
      this.settings.load()
    ]);
  }

  protected readonly todayKey = format(this.now, 'yyyy-MM-dd');
  protected readonly todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(this.now);

  protected readonly dailyLimit = computed(() => this.settings.settings().dailyLimit);
  protected readonly weeklyLimit = computed(() => this.settings.settings().weeklyLimit);

  protected readonly todayExpenses = this.expenses.expensesByDate(this.todayKey);
  protected readonly todayTotal = this.expenses.totalByDate(this.todayKey);

  protected readonly remaining = computed(() => this.dailyLimit() - this.todayTotal());

  protected readonly progress = computed(() => {
    const limit = this.dailyLimit();
    if (limit <= 0) return 0;
    return Math.min(1, Math.max(0, this.todayTotal() / limit));
  });

  protected readonly progressKind = computed(() => {
    const p = this.progress();
    if (p >= 1) return 'danger';
    if (p >= 0.8) return 'warning';
    return 'success';
  });

  protected readonly greeting = computed(() => {
    const hour = this.now.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مرحباً بك';
  });

  protected readonly dailyProgressPercent = computed(() => Math.round(this.progress() * 100));
  protected readonly weeklyProgressPercent = computed(() => Math.round(this.weeklyProgress() * 100));

  private readonly weekStartKey = format(startOfWeek(this.now, { weekStartsOn: 6 }), 'yyyy-MM-dd');
  private readonly weekEndKey = format(endOfWeek(this.now, { weekStartsOn: 6 }), 'yyyy-MM-dd');

  protected readonly weeklyTotal = computed(() => {
    const start = this.weekStartKey;
    const end = this.weekEndKey;

    let sum = 0;
    for (const e of this.expenses.expenses()) {
      if (e.archived) continue;
      if (e.date < start || e.date > end) continue;
      sum += e.amount;
    }

    return sum;
  });

  protected readonly weeklyRemaining = computed(() => this.weeklyLimit() - this.weeklyTotal());

  protected readonly weeklyProgress = computed(() => {
    const limit = this.weeklyLimit();
    if (limit <= 0) return 0;
    return Math.min(1, Math.max(0, this.weeklyTotal() / limit));
  });

  protected readonly weeklyProgressKind = computed(() => {
    const p = this.weeklyProgress();
    if (p >= 1) return 'danger';
    if (p >= 0.8) return 'warning';
    return 'success';
  });

  protected readonly totalSalary = computed(() => this.salaryService.totalSalary());
  protected readonly currentMonth = computed(() => this.salaryService.getCurrentMonth());
  protected readonly currentMonthSalary = computed(() => this.salaryService.getTotalByMonth(this.currentMonth())());

  protected readonly totalExpenses = computed(() => {
    return this.expenses.expenses()
      .filter(e => !e.archived)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected readonly totalBalance = computed(() => {
    return this.totalSalary() - this.totalExpenses();
  });

  async deleteExpense(id: string) {
    const ok = await this.confirm.confirm('هل تريد حذف هذا المصروف؟', 'تأكيد الحذف');
    if (!ok) return;

    await this.expenses.archive(id);
    this.toast.show('تم أرشفة المصروف (يمكن التراجع)', 'success');
  }
}

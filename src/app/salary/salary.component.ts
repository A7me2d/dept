import { Component, inject, computed, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { SalaryService } from '../services/salary.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    DecimalPipe,
    DatePipe,
    NgFor,
    NgIf
  ],
  templateUrl: './salary.component.html',
  styleUrl: './salary.component.scss'
})
export class SalaryComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly salaryService = inject(SalaryService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  // Filter state
  protected readonly selectedYear = signal<string>(new Date().getFullYear().toString());

  protected readonly allSalariesByMonth = this.salaryService.salariesByMonth;
  protected readonly allMonths = this.salaryService.getAllMonths();
  protected readonly currentMonth = this.salaryService.getCurrentMonth();
  
  // Statistics
  protected readonly totalAllTime = this.salaryService.totalSalary;
  
  protected readonly availableYears = computed(() => {
    const years = new Set(this.allSalariesByMonth().map(m => m.month.split('-')[0]));
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  });

  protected readonly filteredSalaries = computed(() => {
    const year = this.selectedYear();
    return this.allSalariesByMonth().filter(group => group.month.startsWith(year));
  });
  
  protected readonly averageMonthly = computed(() => {
    const filtered = this.filteredSalaries();
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, m) => sum + m.total, 0);
    return total / filtered.length;
  });

  protected readonly maxMonthly = computed(() => {
    const filtered = this.filteredSalaries();
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map(m => m.total));
  });

  protected readonly totalForYear = computed(() => {
     return this.filteredSalaries().reduce((sum, m) => sum + m.total, 0);
  });

  protected readonly chartData = computed(() => {
    const filtered = this.filteredSalaries();
    // Sort by month ascending for chart
    const sorted = [...filtered].sort((a, b) => a.month.localeCompare(b.month));
    
    if (sorted.length === 0) return [];
    
    const max = Math.max(...sorted.map(r => r.total));
    return sorted.map(r => ({
      label: this.getMonthName(r.month).split(' ')[0],
      fullLabel: this.getMonthName(r.month),
      amount: r.total,
      heightPercentage: max > 0 ? (r.total / max) * 100 : 0
    }));
  });

  protected editingId: string | null = null;

  protected readonly form = this.fb.group({
    amount: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
    month: this.fb.control<string>(this.currentMonth, [Validators.required]),
    notes: this.fb.control<string>('')
  });

  setYear(year: string) {
    this.selectedYear.set(year);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, month, notes } = this.form.getRawValue();

    if (this.editingId) {
      await this.salaryService.update({ id: this.editingId, amount, month, notes });
      this.toast.show('تم تحديث الراتب بنجاح', 'success');
      this.cancelEdit();
    } else {
      await this.salaryService.add({ amount, month, notes });
      this.toast.show('تم إضافة الراتب بنجاح', 'success');
      this.form.reset({ amount: 0, month: this.currentMonth, notes: '' });
    }
  }

  editSalary(salary: any) {
    this.editingId = salary.id;
    this.form.patchValue({
      amount: salary.amount,
      month: salary.month,
      notes: salary.notes
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ amount: 0, month: this.currentMonth, notes: '' });
  }

  async deleteSalary(id: string) {
    const ok = await this.confirm.confirm('هل تريد حذف هذا الراتب؟', 'تأكيد الحذف');
    if (!ok) return;

    await this.salaryService.remove(id);
    this.toast.show('تم حذف الراتب', 'success');
  }

  getMonthName(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long' }).format(date);
  }

  formatMonthForInput(month: string): string {
    return month;
  }

  generateMonthOptions(): string[] {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i);
      options.push(format(date, 'yyyy-MM'));
    }
    return options;
  }

  getMonthLabel(month: string): string {
    return this.getMonthName(month);
  }
}
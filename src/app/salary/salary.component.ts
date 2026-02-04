import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NgFor, NgIf } from '@angular/common';
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

  protected readonly salariesByMonth = this.salaryService.salariesByMonth;
  protected readonly allMonths = this.salaryService.getAllMonths();
  protected readonly currentMonth = this.salaryService.getCurrentMonth();

  protected readonly form = this.fb.group({
    amount: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
    month: this.fb.control<string>(this.currentMonth, [Validators.required]),
    notes: this.fb.control<string>('')
  });

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, month, notes } = this.form.getRawValue();
    await this.salaryService.add({ amount, month, notes });
    this.toast.show('تم إضافة الراتب بنجاح', 'success');
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

import { NgFor, NgIf } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EXPENSE_CATEGORIES_AR } from '../constants/categories';
import { PaymentMethod } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';
import { ToastService } from '../services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss'
})
export class AddExpenseComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly expenses = inject(ExpenseService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((pm) => pm.get('id'))),
    { initialValue: null }
  );

  protected readonly isEdit = computed(() => !!this.id());

  private readonly defaults = this.expenses.createDefaultsForNow();

  protected readonly categories = EXPENSE_CATEGORIES_AR;

  protected readonly form = this.fb.group({
    amount: this.fb.control<number>(this.defaults.amount, [Validators.required, Validators.min(0.01)]),
    category: this.fb.control<string>(this.defaults.category, [Validators.required]),
    description: this.fb.control<string>(this.defaults.description),
    date: this.fb.control<string>(this.defaults.date, [Validators.required]),
    time: this.fb.control<string>(this.defaults.time, [Validators.required]),
    paymentMethod: this.fb.control<PaymentMethod>(this.defaults.paymentMethod, [Validators.required])
  });

  private loadedId: string | null = null;

  constructor() {
    effect(() => {
      const id = this.id();
      void this.tryLoad(id);
    });
  }

  private async tryLoad(id: string | null) {
    if (!id) return;
    if (this.loadedId === id) return;
    this.loadedId = id;

    const expense = await this.expenses.getById(id);
    if (!expense) {
      this.toast.show('المصروف غير موجود', 'danger');
      await this.router.navigateByUrl('/');
      return;
    }

    this.form.patchValue({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      time: expense.time,
      paymentMethod: expense.paymentMethod
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    if (this.isEdit()) {
      const updated = await this.expenses.update({
        id: this.id() as string,
        ...v
      });

      if (!updated) {
        this.toast.show('تعذر الحفظ', 'danger');
        return;
      }

      this.toast.show('تم التحديث', 'success');
    } else {
      await this.expenses.add(v);
      this.toast.show('تمت الإضافة', 'success');
    }

    await this.router.navigateByUrl('/');
  }

  async cancel() {
    await this.router.navigateByUrl('/');
  }
}

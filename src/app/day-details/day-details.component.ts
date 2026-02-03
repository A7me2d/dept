import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseService } from '../services/expense.service';
import { ToastService } from '../services/toast.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-day-details',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DecimalPipe, MatIconModule, MatButtonModule],
  templateUrl: './day-details.component.html',
  styleUrl: './day-details.component.scss'
})
export class DayDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenses = inject(ExpenseService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);

  protected readonly date = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('date') ?? '')), {
    initialValue: ''
  });

  private readonly fmt = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  protected readonly dateLabel = computed(() => {
    const key = this.date();
    const d = new Date(`${key}T00:00:00`);
    if (Number.isNaN(d.getTime())) return key;
    return this.fmt.format(d);
  });

  protected readonly items = computed(() => this.expenses.expensesByDate(this.date())());
  protected readonly total = computed(() => this.items().reduce((sum, e) => sum + e.amount, 0));

  async deleteExpense(id: string) {
    const ok = await this.confirm.confirm('هل تريد حذف هذا المصروف؟', 'تأكيد الحذف');
    if (!ok) return;

    await this.expenses.remove(id);
    this.toast.show('تم حذف المصروف', 'success');
  }

  async back() {
    await this.router.navigateByUrl('/history');
  }
}

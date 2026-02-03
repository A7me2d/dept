import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DecimalPipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  private readonly expenses = inject(ExpenseService);

  protected readonly days = computed(() => this.expenses.groupedDailyTotals());

  private readonly fmt = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  formatDateLabel(dateKey: string) {
    const d = new Date(`${dateKey}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateKey;
    return this.fmt.format(d);
  }
}

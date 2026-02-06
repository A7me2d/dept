import { Component, computed, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly current = computed(() => this.settings.settings());

  protected readonly form = this.fb.group({
    dailyLimit: this.fb.control<number>(this.current().dailyLimit, [Validators.required, Validators.min(0)]),
    weeklyLimit: this.fb.control<number>(this.current().weeklyLimit, [Validators.required, Validators.min(0)]),
    currency: this.fb.control<string>(this.current().currency)
  });

  constructor() {
    effect(() => {
      const s = this.current();
      if (this.form.dirty) return;
      this.form.patchValue(
        {
          dailyLimit: s.dailyLimit,
          weeklyLimit: s.weeklyLimit,
          currency: s.currency
        },
        { emitEvent: false }
      );
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.settings.update(this.form.getRawValue());
    this.toast.show('تم حفظ الإعدادات', 'success');
    await this.router.navigateByUrl('/');
  }
}

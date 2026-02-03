import { NgClass, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  private readonly toast = inject(ToastService);

  protected readonly state = this.toast.state;

  protected readonly kindClass = computed(() => {
    const kind = this.state().kind;
    if (kind === 'success') return 'toast--success';
    if (kind === 'danger') return 'toast--danger';
    return 'toast--info';
  });

  dismiss() {
    this.toast.dismiss();
  }
}

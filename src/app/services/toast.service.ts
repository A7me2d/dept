import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'danger' | 'info';

export interface ToastState {
  open: boolean;
  message: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly state = signal<ToastState>({ open: false, message: '', kind: 'info' });
  private timer: number | null = null;

  show(message: string, kind: ToastKind = 'info', durationMs = 2200) {
    this.state.set({ open: true, message, kind });

    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = window.setTimeout(() => {
      this.dismiss();
    }, durationMs);
  }

  dismiss() {
    this.state.update((s) => ({ ...s, open: false }));
  }
}

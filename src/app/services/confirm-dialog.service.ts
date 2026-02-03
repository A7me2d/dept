import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  async confirm(message?: string, title?: string): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message, title }
    });

    const result = await ref.afterClosed().toPromise();
    return result === true;
  }
}

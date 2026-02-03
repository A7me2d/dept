import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content>{{ message }}</mat-dialog-content>
    <mat-dialog-actions align="start">
      <button mat-button (click)="dialogRef.close(false)">إلغاء</button>
      <button mat-button color="warn" (click)="dialogRef.close(true)">حذف</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  title = 'تأكيد الحذف';
  message = 'هل تريد حذف هذا المصروف؟';

  constructor(public dialogRef: MatDialogRef<boolean>) {}
}

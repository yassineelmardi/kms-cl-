import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  keyName: string;
  confirmLabel: string;
  confirmColor: 'warn' | 'accent' | 'primary';
  icon: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-header" [ngClass]="'header-' + data.confirmColor">
      <mat-icon>{{ data.icon }}</mat-icon>
      <h2 mat-dialog-title>{{ data.title }}</h2>
    </div>

    <mat-dialog-content>
      <p class="dialog-message">{{ data.message }}</p>
      <div class="key-name-box">
        <mat-icon>vpn_key</mat-icon>
        <span>{{ data.keyName }}</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onCancel()">Annuler</button>
      <button
        mat-flat-button
        [color]="data.confirmColor"
        (click)="onConfirm()"
      >
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem 0.75rem;
      border-radius: 4px 4px 0 0;

      h2 { margin: 0; font-size: 1.1rem; font-weight: 600; }
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .header-warn    { background: #fdecea; color: #b71c1c; }
    .header-accent  { background: #fff3e0; color: #e65100; }
    .header-primary { background: #e3f2fd; color: #1565c0; }

    mat-dialog-content {
      padding: 1rem 1.5rem !important;
    }
    .dialog-message {
      color: #555;
      margin: 0 0 1rem;
    }
    .key-name-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: #1a237e;

      mat-icon { color: #1565c0; font-size: 18px; width: 18px; height: 18px; }
    }
    mat-dialog-actions {
      padding: 0.75rem 1.5rem 1rem !important;
      gap: 0.5rem;
    }
  `],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void { this.dialogRef.close(true); }
  onCancel(): void  { this.dialogRef.close(false); }
}

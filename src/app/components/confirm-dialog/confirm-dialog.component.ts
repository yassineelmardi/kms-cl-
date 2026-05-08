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
      <div class="header-icon-wrap" [ngClass]="'icon-' + data.confirmColor">
        <mat-icon>{{ data.icon }}</mat-icon>
      </div>
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
      <button mat-stroked-button class="btn-cancel" (click)="onCancel()">Annuler</button>
      <button
        mat-flat-button
        [color]="data.confirmColor"
        class="btn-confirm"
        (click)="onConfirm()"
      >
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 16px;
      h2 {
        margin: 0;
        padding: 0 !important;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #0f172a;
      }
    }

    .header-icon-wrap {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &.icon-warn   { background: #fef2f2; mat-icon { color: #b91c1c; } }
      &.icon-accent { background: #fffbeb; mat-icon { color: #b45309; } }
    }

    mat-dialog-content {
      padding: 0 24px 16px !important;
      margin: 0 !important;
      max-height: none !important;
    }

    .dialog-message {
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
      margin: 0 0 12px;
    }

    .key-name-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #1e3a8a;
      mat-icon { color: #2563eb; font-size: 16px; width: 16px; height: 16px; }
    }

    mat-dialog-actions {
      padding: 12px 24px 20px !important;
      margin: 0 !important;
      gap: 8px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-cancel {
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #475569 !important;
      border-color: #e2e8f0 !important;
      height: 36px !important;
      padding: 0 16px !important;
    }

    .btn-confirm {
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      height: 36px !important;
      padding: 0 16px !important;
    }
  `],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void { this.dialogRef.close(true); }
  onCancel(): void  { this.dialogRef.close(false); }
}

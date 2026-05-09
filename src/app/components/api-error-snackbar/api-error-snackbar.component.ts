import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface SnackbarData {
  message: string;
  type: 'error' | 'success' | 'warning';
}

@Component({
  selector: 'app-api-error-snackbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="snackbar-inner">
      <div class="snackbar-icon-wrap" [ngClass]="'icon-' + data.type">
        <mat-icon>{{ iconMap[data.type] }}</mat-icon>
      </div>
      <div class="snackbar-body">
        <span class="snackbar-type-label">{{ typeLabel[data.type] }}</span>
        <span class="snackbar-message">{{ data.message }}</span>
      </div>
      <button mat-icon-button class="snackbar-close" (click)="dismiss()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .snackbar-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }

    .snackbar-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.icon-error   { background: rgba(239,68,68,0.15); color: #fca5a5; }
      &.icon-success { background: rgba(34,197,94,0.15); color: #86efac; }
      &.icon-warning { background: rgba(234,179,8,0.15);  color: #fde047; }
    }

    .snackbar-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .snackbar-type-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.7;
    }

    .snackbar-message {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      word-break: break-word;
    }

    .snackbar-close {
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.15s;
      color: inherit !important;

      &:hover { opacity: 1; }

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiErrorSnackbarComponent {
  readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(MatSnackBarRef);

  readonly iconMap = { error: 'error_outline', success: 'check_circle_outline', warning: 'warning_amber' };
  readonly typeLabel = { error: 'Erreur', success: 'Succès', warning: 'Avertissement' };

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}

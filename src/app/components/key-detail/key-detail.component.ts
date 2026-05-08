import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { switchMap, catchError, of, filter } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { KeysService } from '../../services/keys.service';
import { KeyDetailDTO } from '../../models/keys.model';

@Component({
  selector: 'app-key-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './key-detail.component.html',
  styleUrl: './key-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyDetailComponent {
  readonly keyId = input.required<number>();

  // ── Outputs ───────────────────────────────────────────────────────────────────
  readonly keyDeleted    = output<number>();
  readonly keyDeactivated = output<number>();

  private readonly keysService = inject(KeysService);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly dialog      = inject(MatDialog);

  readonly loading      = signal(false);
  readonly error        = signal<string | null>(null);
  readonly detail       = signal<KeyDetailDTO | null>(null);
  readonly deleting     = signal(false);
  readonly deactivating = signal(false);

  constructor() {
    toObservable(this.keyId)
      .pipe(
        switchMap(id => {
          this.loading.set(true);
          this.error.set(null);
          this.detail.set(null);
          return this.keysService.getKeyById(id).pipe(
            catchError(err => {
              this.error.set(err?.error?.message ?? err?.message ?? 'Erreur lors du chargement.');
              this.loading.set(false);
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        if (data !== null) {
          this.detail.set(data);
          this.loading.set(false);
        }
      });
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'active') return 'status-active';
    if (s === 'revoked') return 'status-revoked';
    if (s === 'expired') return 'status-expired';
    return 'status-unknown';
  }

  getCertClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'valid') return 'cert-valid';
    if (s === 'revoked') return 'cert-revoked';
    if (s === 'expired') return 'cert-expired';
    return 'cert-none';
  }

  onDelete(): void {
    const name = this.detail()?.name ?? 'cette clé';
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer la clé',
        message: 'Êtes-vous sûr de vouloir supprimer définitivement la clé :',
        keyName: name,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn',
        icon: 'delete_forever',
      },
    }).afterClosed()
      .pipe(
        filter(result => result === true),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.deleting.set(true);
        this.keysService.deleteKey(this.keyId())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.deleting.set(false);
              this.keyDeleted.emit(this.keyId());
            },
            error: err => {
              this.error.set(err?.error?.message ?? err?.message ?? 'Erreur lors de la suppression.');
              this.deleting.set(false);
            },
          });
      });
  }

  onDeactivate(): void {
    const name = this.detail()?.name ?? 'cette clé';
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Désactiver la clé',
        message: 'Êtes-vous sûr de vouloir désactiver la clé :',
        keyName: name,
        confirmLabel: 'Désactiver',
        confirmColor: 'accent',
        icon: 'block',
      },
    }).afterClosed()
      .pipe(
        filter(result => result === true),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.deactivating.set(true);
        this.keysService.deactivateKey(this.keyId())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: updated => {
              this.detail.set(updated);
              this.deactivating.set(false);
              this.keyDeactivated.emit(this.keyId());
            },
            error: err => {
              this.error.set(err?.error?.message ?? err?.message ?? 'Erreur lors de la désactivation.');
              this.deactivating.set(false);
            },
          });
      });
  }
}

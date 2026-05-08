import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { switchMap, catchError, of } from 'rxjs';

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

  private readonly keysService = inject(KeysService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly detail = signal<KeyDetailDTO | null>(null);

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
}

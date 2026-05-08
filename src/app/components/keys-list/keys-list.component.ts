import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { KeyDetailComponent } from '../key-detail/key-detail.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  catchError,
  tap,
  startWith,
} from 'rxjs';

import { KeysService } from '../../services/keys.service';
import { KeysListDTO, PagedKeysListDTO } from '../../models/keys.model';

export const DISPLAYED_COLUMNS = [
  'id',
  'name',
  'algorithm',
  'sizeOrCurve',
  'status',
  'type',
  'certified',
  'certificateStatus',
] as const;

@Component({
  selector: 'app-keys-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    KeyDetailComponent,
  ],
  templateUrl: './keys-list.component.html',
  styleUrl: './keys-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeysListComponent implements OnInit {
  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly applicationId = input.required<number | string>();

  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly keysService = inject(KeysService);
  private readonly destroyRef = inject(DestroyRef);

  // ── ViewChild ─────────────────────────────────────────────────────────────
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ── Signals (state) ───────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<KeysListDTO[]>([]);
  readonly totalElements = signal(0);
  readonly selectedKeyId = signal<number | null>(null);

  // ── Table config ──────────────────────────────────────────────────────────
  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly pageSizeOptions = [10, 20, 50];
  readonly defaultPageSize = 20;

  // ── Reactive controls ─────────────────────────────────────────────────────
  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  private readonly pagination$ = new BehaviorSubject<{ page: number; size: number }>({
    page: 0,
    size: this.defaultPageSize,
  });

  private readonly sort$ = new BehaviorSubject<Sort>({ active: '', direction: '' });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(350),
        distinctUntilChanged()
      ),
      this.pagination$,
      this.sort$,
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(([name, { page, size }, sortState]) =>
          this.keysService
            .getKeys({
              applicationId: this.applicationId(),
              page,
              size,
              name: name ?? '',
              sortField: sortState.active || undefined,
              sortDir:
                sortState.direction === 'asc' || sortState.direction === 'desc'
                  ? sortState.direction
                  : undefined,
            })
            .pipe(
              catchError((err) => {
                const msg =
                  err?.error?.message ?? err?.message ?? 'An unexpected error occurred.';
                this.error.set(msg);
                return of<PagedKeysListDTO>({
                  content: [],
                  totalElements: 0,
                  totalPages: 0,
                  pageNumber: 0,
                  pageSize: size,
                  last: true,
                });
              })
            )
        ),
        tap((response) => {
          this.data.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  onPageChange(event: PageEvent): void {
    this.pagination$.next({ page: event.pageIndex, size: event.pageSize });
  }

  onSortChange(sortState: Sort): void {
    // Reset to page 0 when sort changes
    this.pagination$.next({ ...this.pagination$.value, page: 0 });
    this.sort$.next(sortState);
  }

  onSearchClear(): void {
    this.searchControl.reset('');
  }

  onRowClick(key: KeysListDTO | null): void {
    if (key === null) {
      this.selectedKeyId.set(null);
      return;
    }
    this.selectedKeyId.set(
      this.selectedKeyId() === key.id ? null : key.id
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  trackById(_: number, key: KeysListDTO): number {
    return key.id;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'status-active',
      REVOKED: 'status-revoked',
      EXPIRED: 'status-expired',
      PENDING: 'status-pending',
    };
    return map[status] ?? 'status-unknown';
  }

  getCertStatusColor(status: string): string {
    const map: Record<string, string> = {
      VALID: 'cert-valid',
      EXPIRED: 'cert-expired',
      REVOKED: 'cert-revoked',
      NONE: 'cert-none',
    };
    return map[status] ?? 'cert-none';
  }
}

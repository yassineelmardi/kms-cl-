import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

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
  EMPTY,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import { KeysService } from '../../services/keys.service';
import { ApplicationsService } from '../../services/applications.service';
import { ApplicationSelectionService } from '../../services/application-selection.service';
import { KeysListDTO, PagedKeysListDTO } from '../../models/keys.model';
import { ApplicationDTO } from '../../models/applications.model';

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
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDividerModule,
    KeyDetailComponent,
  ],
  templateUrl: './keys-list.component.html',
  styleUrl: './keys-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeysListComponent implements OnInit {
  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly keysService  = inject(KeysService);
  private readonly appsService  = inject(ApplicationsService);
  private readonly appSelection = inject(ApplicationSelectionService);
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly snackBar     = inject(MatSnackBar);
  private readonly destroyRef   = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ── Application state ────────────────────────────────────────────────────
  readonly selectedApp   = signal<ApplicationDTO | null>(null);
  readonly appLoading    = signal(false);
  readonly appSearching  = signal(false);
  readonly appSuggestions = signal<ApplicationDTO[]>([]);

  // ── App search autocomplete control ──────────────────────────────────────
  readonly appSearchControl = new FormControl<string | ApplicationDTO>('', { nonNullable: true });

  /** Valeur textuelle de l'autocomplete (toujours string, jamais ApplicationDTO) */
  get appSearchStr(): string {
    const v = this.appSearchControl.value;
    return typeof v === 'string' ? v : (v?.name ?? '');
  }

  // ── Keys state ───────────────────────────────────────────────────────────
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly data          = signal<KeysListDTO[]>([]);
  readonly totalElements = signal(0);
  readonly selectedKeyId = signal<number | null>(null);

  /** true quand une app est sélectionnée et les clés peuvent être affichées */
  readonly hasApp = computed(() => this.selectedApp() !== null);

  // ── Keys search control ──────────────────────────────────────────────────
  readonly keySearchControl = new FormControl<string>('', { nonNullable: true });

  // ── Table config ─────────────────────────────────────────────────────────
  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly pageSizeOptions  = [10, 20, 50];
  readonly defaultPageSize  = 20;

  private readonly pagination$ = new BehaviorSubject<{ page: number; size: number }>({
    page: 0,
    size: this.defaultPageSize,
  });
  private readonly sort$ = new BehaviorSubject<Sort>({ active: '', direction: '' });

  /** Signal interne pour déclencher le rechargement des clés quand l'app change */
  private readonly appId$ = new BehaviorSubject<number | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initAppSearch();
    this.initKeysStream();

    // Mode URL : /applications/:applicationId/keys
    const paramId = this.route.snapshot.paramMap.get('applicationId');
    if (paramId) {
      const id = Number(paramId);
      if (!isNaN(id)) {
        this.loadApplicationById(id);
        return;
      }
    }

    // Mode service de sélection (navigation depuis Applications list)
    const preselected = this.appSelection.selectedApp();
    if (preselected) {
      this.setApplication(preselected);
    }
    // Sinon : mode autonome, l'utilisateur cherche lui-même
  }

  // ── App autocomplete ──────────────────────────────────────────────────────
  private initAppSearch(): void {
    this.appSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const query = typeof value === 'string' ? value : '';
        if (query.length < 2) {
          this.appSuggestions.set([]);
          return EMPTY;
        }
        this.appSearching.set(true);
        return this.appsService.getApplications({ name: query, size: 10 }).pipe(
          catchError(() => of({ content: [], totalElements: 0, totalPages: 0, pageNumber: 0, pageSize: 10, last: true }))
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.appSuggestions.set(result.content ?? []);
      this.appSearching.set(false);
    });
  }

  // ── Keys stream ──────────────────────────────────────────────────────────
  private initKeysStream(): void {
    combineLatest([
      this.appId$.pipe(filter(id => id !== null)),
      this.keySearchControl.valueChanges.pipe(startWith(''), debounceTime(350), distinctUntilChanged()),
      this.pagination$,
      this.sort$,
    ]).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(([appId, name, { page, size }, sortState]) =>
        this.keysService.getKeys({
          applicationId: appId!,
          page,
          size,
          name: name ?? '',
          sortField: sortState.active || undefined,
          sortDir: sortState.direction === 'asc' || sortState.direction === 'desc'
            ? sortState.direction : undefined,
        }).pipe(
          catchError(err => {
            this.error.set(err?.error?.message ?? err?.message ?? 'Erreur inattendue.');
            return of<PagedKeysListDTO>({ content: [], totalElements: 0, totalPages: 0, pageNumber: 0, pageSize: size, last: true });
          })
        )
      ),
      tap(response => {
        this.data.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  // ── Helpers privés ───────────────────────────────────────────────────────
  private setApplication(app: ApplicationDTO): void {
    this.selectedApp.set(app);
    this.appSelection.selectApp(app);
    this.appSearchControl.setValue(app.name, { emitEvent: false });
    this.selectedKeyId.set(null);
    this.pagination$.next({ page: 0, size: this.defaultPageSize });
    this.appId$.next(app.id);
  }

  private loadApplicationById(id: number): void {
    // Cache service d'abord
    const cached = this.appSelection.getCached(id);
    if (cached) { this.setApplication(cached); return; }

    this.appLoading.set(true);
    this.appsService.getApplicationById(id).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(detail => {
      this.appLoading.set(false);
      if (detail) {
        const app: ApplicationDTO = {
          id: detail.id, name: detail.name, irn: detail.irn,
          sia: detail.sia, ipn: detail.ipn ?? '',
          status: detail.status ?? 'Unknown', type: detail.type ?? '',
          linkedToKeyTemplate: null,
        };
        this.setApplication(app);
      }
      // Si null (API indisponible ou 404) : on reste en empty state, l'utilisateur cherche lui-même
    });
  }

  // ── Autocomplete display ─────────────────────────────────────────────────
  displayAppFn(value: string | ApplicationDTO): string {
    return typeof value === 'string' ? value : (value?.name ?? '');
  }

  onAppSelected(app: ApplicationDTO): void {
    this.setApplication(app);
  }

  onAppSearchCleared(): void {
    this.appSearchControl.setValue('');
    this.appSuggestions.set([]);
    this.selectedApp.set(null);
    this.appSelection.clearSelection();
    this.data.set([]);
    this.totalElements.set(0);
    this.selectedKeyId.set(null);
    this.appId$.next(null);
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  goBackToApplications(): void {
    this.router.navigate(['/applications']);
  }

  // ── Table handlers ───────────────────────────────────────────────────────
  onPageChange(event: PageEvent): void {
    this.pagination$.next({ page: event.pageIndex, size: event.pageSize });
  }

  onSortChange(sortState: Sort): void {
    this.pagination$.next({ ...this.pagination$.value, page: 0 });
    this.sort$.next(sortState);
  }

  onKeySearchClear(): void {
    this.keySearchControl.reset('');
  }

  onAddKey(): void {
    this.snackBar.open('Fonctionnalite "Ajouter une cle" a implementer.', 'OK', { duration: 3000 });
  }

  onKeyDeleted(id: number): void {
    this.selectedKeyId.set(null);
    this.pagination$.next({ ...this.pagination$.value });
  }

  onKeyDeactivated(_id: number): void {
    this.pagination$.next({ ...this.pagination$.value });
  }

  onRowClick(key: KeysListDTO | null): void {
    if (key === null) { this.selectedKeyId.set(null); return; }
    this.selectedKeyId.set(this.selectedKeyId() === key.id ? null : key.id);
  }

  // ── Style helpers ────────────────────────────────────────────────────────
  trackById(_: number, key: KeysListDTO): number { return key.id; }
  trackByAppId(_: number, app: ApplicationDTO): number { return app.id; }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'status-active', REVOKED: 'status-revoked',
      EXPIRED: 'status-expired', PENDING: 'status-pending',
    };
    return map[status] ?? 'status-unknown';
  }

  getCertStatusColor(status: string): string {
    const map: Record<string, string> = {
      VALID: 'cert-valid', EXPIRED: 'cert-expired',
      REVOKED: 'cert-revoked', NONE: 'cert-none',
    };
    return map[status] ?? 'cert-none';
  }

  getAppStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'active')   return 'badge--active';
    if (s === 'pending')  return 'badge--pending';
    if (s === 'inactive') return 'badge--inactive';
    if (s === 'draft')    return 'badge--draft';
    return 'badge--unknown';
  }
}

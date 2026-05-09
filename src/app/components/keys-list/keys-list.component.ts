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
    KeyDetailComponent,
  ],
  templateUrl: './keys-list.component.html',
  styleUrl: './keys-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeysListComponent implements OnInit {
  // â”€â”€ DI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private readonly keysService      = inject(KeysService);
  private readonly appsService      = inject(ApplicationsService);
  private readonly appSelection     = inject(ApplicationSelectionService);
  private readonly route            = inject(ActivatedRoute);
  private readonly router           = inject(Router);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly destroyRef       = inject(DestroyRef);

  // â”€â”€ ViewChild â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // â”€â”€ Resolved application state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** ID rÃ©solu depuis l'URL (/applications/:applicationId/keys) */
  readonly resolvedAppId = signal<number | null>(null);
  /** Application chargée depuis l'API ou le service de sélection */
  readonly application   = signal<ApplicationDTO | null>(null);
  readonly appLoading    = signal(false);

  // â”€â”€ Breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly breadcrumb = computed(() => {
    const app = this.application();
    return {
      appName: app?.name ?? 'â€¦',
      appStatus: app?.status ?? '',
      appId: this.resolvedAppId() ?? 0,
    };
  });

  // â”€â”€ Signals (state) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly loading       = signal(false);
  readonly error         = signal<string | null>(null);
  readonly data          = signal<KeysListDTO[]>([]);
  readonly totalElements = signal(0);
  readonly selectedKeyId = signal<number | null>(null);

  // â”€â”€ Table config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly displayedColumns  = [...DISPLAYED_COLUMNS];
  readonly pageSizeOptions   = [10, 20, 50];
  readonly defaultPageSize   = 20;

  // â”€â”€ Reactive controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  private readonly pagination$ = new BehaviorSubject<{ page: number; size: number }>({
    page: 0,
    size: this.defaultPageSize,
  });
  private readonly sort$ = new BehaviorSubject<Sort>({ active: '', direction: '' });

  // â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ngOnInit(): void {
    // Résoudre l'applicationId depuis l'URL
    const paramId = this.route.snapshot.paramMap.get('applicationId');
    if (paramId) {
      const id = Number(paramId);
      if (isNaN(id)) {
        this.snackBar.open('Application introuvable.', 'Fermer', { duration: 4000 });
        this.router.navigate(['/applications']);
        return;
      }
      this.resolvedAppId.set(id);
      this.loadApplication(id);
    } else {
      // Compatibilité descendante : utiliser le service de sélection
      const selected = this.appSelection.selectedApp();
      if (selected) {
        this.resolvedAppId.set(selected.id);
        this.application.set(selected);
      } else {
        this.snackBar.open('Veuillez sélectionner une application.', 'Fermer', { duration: 4000 });
        this.router.navigate(['/applications']);
        return;
      }
    }

    // Démarrer le flux de données
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
              applicationId: this.resolvedAppId()!,
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
                const msg = err?.error?.message ?? err?.message ?? 'Erreur inattendue.';
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

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  goBackToApplications(): void {
    this.router.navigate(['/applications']);
  }

  // â”€â”€ Application loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private loadApplication(id: number): void {
    // Utiliser d'abord le service de sélection (évite un appel HTTP supplémentaire)
    const cached = this.appSelection.selectedApp();
    if (cached && cached.id === id) {
      this.application.set(cached);
      return;
    }

    this.appLoading.set(true);
    this.appsService.getApplicationById(id).pipe(
      catchError(() => {
        this.snackBar.open(`Application ID ${id} introuvable.`, 'Fermer', { duration: 5000 });
        this.router.navigate(['/applications']);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(app => {
      if (app) {
        // ApplicationDetailDTO â†’ cast partiel vers ApplicationDTO pour le breadcrumb
        this.application.set({ id: app.id, name: app.name, irn: app.irn, sia: app.sia, ipn: '', status: app.status ?? 'Unknown', type: '', linkedToKeyTemplate: null });
        this.appSelection.selectApp({ id: app.id, name: app.name, irn: app.irn, sia: app.sia, ipn: '', status: app.status ?? 'Unknown', type: '', linkedToKeyTemplate: null });
      }
      this.appLoading.set(false);
    });
  }

  // â”€â”€ Event handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onPageChange(event: PageEvent): void {
    this.pagination$.next({ page: event.pageIndex, size: event.pageSize });
  }

  onSortChange(sortState: Sort): void {
    this.pagination$.next({ ...this.pagination$.value, page: 0 });
    this.sort$.next(sortState);
  }

  onSearchClear(): void {
    this.searchControl.reset('');
  }

  onAddKey(): void {
    alert('Fonctionnalité "Ajouter une clé" Ã  implÃ©menter.');
  }

  onKeyDeleted(id: number): void {
    this.selectedKeyId.set(null);
    this.pagination$.next({ ...this.pagination$.value });
  }

  onKeyDeactivated(id: number): void {
    this.pagination$.next({ ...this.pagination$.value });
  }

  onRowClick(key: KeysListDTO | null): void {
    if (key === null) { this.selectedKeyId.set(null); return; }
    this.selectedKeyId.set(this.selectedKeyId() === key.id ? null : key.id);
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  trackById(_: number, key: KeysListDTO): number { return key.id; }

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

  getStatusBadgeClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'active')   return 'status--active';
    if (s === 'pending')  return 'status--pending';
    if (s === 'inactive') return 'status--inactive';
    return 'status--unknown';
  }
}


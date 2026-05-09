import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ApplicationsService } from '../../services/applications.service';
import { NotificationService } from '../../services/notification.service';
import { ApplicationDTO } from '../../models/applications.model';
import { ApplicationDetailComponent } from '../application-detail/application-detail.component';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    ApplicationDetailComponent,
  ],
  templateUrl: './applications-list.component.html',
  styleUrl: './applications-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('cardAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('220ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('detailPanel', [
      transition(':enter', [
        style({ opacity: 0, width: '0px', minWidth: '0px' }),
        animate('280ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, width: '*', minWidth: '*' })),
      ]),
      transition(':leave', [
        animate('220ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, width: '0px', minWidth: '0px' })),
      ]),
    ]),
  ],
})
export class ApplicationsListComponent implements OnInit {
  private readonly appsService   = inject(ApplicationsService);
  private readonly notif         = inject(NotificationService);
  private readonly destroyRef    = inject(DestroyRef);

  @ViewChild('gridContainer') gridRef!: ElementRef<HTMLDivElement>;

  // ── State ──────────────────────────────────────────────────
  readonly applications   = signal<ApplicationDTO[]>([]);
  readonly loading        = signal(false);
  readonly isFirstLoad    = signal(true);
  readonly isLastPage     = signal(false);
  readonly totalElements  = signal(0);
  readonly searchQuery    = signal('');
  readonly statusFilter   = signal('');
  readonly typeFilter     = signal('');

  /** ID de l'application sélectionnée (master-detail) */
  readonly selectedAppId  = signal<number | null>(null);

  private currentPage = 0;
  private readonly PAGE_SIZE = 30;
  private readonly search$ = new Subject<string>();

  readonly skeletons = Array.from({ length: 9 }, (_, i) => i);
  readonly hasActiveFilters = computed(
    () => !!this.searchQuery() || !!this.statusFilter() || !!this.typeFilter()
  );

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.reload();
    });

    this.loadPage(0);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.selectedAppId.set(null);
  }

  onScroll(event: Event): void {
    if (this.loading() || this.isLastPage()) return;
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  clearSearch(): void {
    this.search$.next('');
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.reload();
  }

  onTypeFilter(value: string): void {
    this.typeFilter.set(value);
    this.reload();
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.typeFilter.set('');
    this.reload();
  }

  // ── Sélection master-detail ────────────────────────────────
  selectApp(app: ApplicationDTO, event: Event): void {
    event.stopPropagation();
    this.selectedAppId.set(
      this.selectedAppId() === app.id ? null : app.id
    );
  }

  onDetailClosed(): void {
    this.selectedAppId.set(null);
  }

  isSelected(app: ApplicationDTO): boolean {
    return this.selectedAppId() === app.id;
  }

  // ── Actions ────────────────────────────────────────────────
  onView(app: ApplicationDTO, event?: Event): void {
    event?.stopPropagation();
    this.selectedAppId.set(app.id);
  }

  onEdit(app: ApplicationDTO, event?: Event): void {
    event?.stopPropagation();
    this.notif.showWarning(`Édition de l'application : ${app.name} (à implémenter)`);
  }

  onDelete(app: ApplicationDTO, event?: Event): void {
    event?.stopPropagation();
    this.notif.showError(`Suppression de "${app.name}" (à implémenter)`);
  }

  onViewKeys(app: ApplicationDTO, event?: Event): void {
    event?.stopPropagation();
    this.notif.showSuccess(`Clés de l'application ID ${app.id}`);
  }

  // ── Styling helpers ────────────────────────────────────────
  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'active')   return 'status--active';
    if (s === 'pending')  return 'status--pending';
    if (s === 'draft')    return 'status--draft';
    if (s === 'inactive') return 'status--inactive';
    return 'status--unknown';
  }

  getAvatarClass(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'internal') return 'avatar--blue';
    if (t === 'external') return 'avatar--green';
    if (t === 'partner')  return 'avatar--purple';
    return 'avatar--gray';
  }

  getTypeClass(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'internal') return 'type--internal';
    if (t === 'external') return 'type--external';
    if (t === 'partner')  return 'type--partner';
    return 'type--unknown';
  }

  getAppIcon(type: string): string {
    const t = type?.toLowerCase();
    if (t === 'internal') return 'business';
    if (t === 'external') return 'public';
    if (t === 'partner')  return 'handshake';
    return 'apps';
  }

  getTypeIcon(type: string): string {
    return this.getAppIcon(type);
  }

  // ── Data loading ───────────────────────────────────────────
  private reload(): void {
    this.currentPage = 0;
    this.applications.set([]);
    this.isLastPage.set(false);
    this.isFirstLoad.set(true);
    this.loadPage(0);
  }

  private loadPage(page: number): void {
    if (this.loading()) return;
    this.loading.set(true);

    this.appsService.getApplications({
      page,
      size: this.PAGE_SIZE,
      name:   this.searchQuery() || undefined,
      status: this.statusFilter() || undefined,
      type:   this.typeFilter()   || undefined,
    }).pipe(
      catchError(err => {
        this.notif.showApiError(err, 'Erreur lors du chargement des applications.');
        this.loading.set(false);
        this.isFirstLoad.set(false);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      if (!data) return;

      if (page === 0) {
        this.applications.set(data.content);
      } else {
        this.applications.update(list => [...list, ...data.content]);
      }

      this.totalElements.set(data.totalElements);
      this.isLastPage.set(data.last);
      this.currentPage = page;
      this.loading.set(false);
      this.isFirstLoad.set(false);
    });
  }
}


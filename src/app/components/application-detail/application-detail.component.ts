import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { catchError, of, switchMap } from 'rxjs';
import { Subject } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApplicationDetailDTO } from '../../models/applications.model';
import { ApplicationsService } from '../../services/applications.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate('260ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateX(40px)' })),
      ]),
    ]),
  ],
})
export class ApplicationDetailComponent implements OnChanges {
  private readonly appsService = inject(ApplicationsService);
  private readonly notif       = inject(NotificationService);
  private readonly destroyRef  = inject(DestroyRef);

  /** ID de l'application à charger — null = panneau fermé */
  readonly appId = input<number | null>(null);

  /** Émis quand l'utilisateur clique sur Fermer */
  readonly closed = output<void>();

  readonly detail      = signal<ApplicationDetailDTO | null>(null);
  readonly loading     = signal(false);
  readonly loadError   = signal(false);

  /** Les skeletons pour le loader */
  readonly skeletonRows = [1, 2, 3, 4, 5, 6];

  private readonly load$ = new Subject<number>();

  constructor() {
    this.load$.pipe(
      switchMap(id => {
        this.loading.set(true);
        this.loadError.set(false);
        this.detail.set(null);
        return this.appsService.getApplicationById(id).pipe(
          catchError(err => {
            this.notif.showApiError(err, 'Impossible de charger le détail de l\'application.');
            this.loadError.set(true);
            this.loading.set(false);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(detail => {
      this.detail.set(detail);
      this.loading.set(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const id = changes['appId']?.currentValue as number | null;
    if (id != null) {
      this.load$.next(id);
    } else {
      this.detail.set(null);
      this.loading.set(false);
      this.loadError.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }

  // ── Helpers visuels ────────────────────────────────────────
  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'active')   return 'status--active';
    if (s === 'pending')  return 'status--pending';
    if (s === 'draft')    return 'status--draft';
    if (s === 'inactive') return 'status--inactive';
    return 'status--unknown';
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

  getPermissionIcon(perm: string): string {
    if (perm.includes('create')) return 'add_circle_outline';
    if (perm.includes('update') || perm.includes('edit')) return 'edit_note';
    if (perm.includes('delete') || perm.includes('remove')) return 'delete_outline';
    if (perm.includes('read') || perm.includes('view')) return 'visibility';
    if (perm.includes('key')) return 'vpn_key';
    if (perm.includes('admin')) return 'admin_panel_settings';
    return 'shield';
  }

  getPermissionClass(perm: string): string {
    if (perm.includes('create')) return 'perm--create';
    if (perm.includes('update') || perm.includes('edit')) return 'perm--update';
    if (perm.includes('delete') || perm.includes('remove')) return 'perm--delete';
    if (perm.includes('read') || perm.includes('view')) return 'perm--read';
    return 'perm--default';
  }

  formatPermission(perm: string): string {
    return perm.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { ApplicationDTO } from '../models/applications.model';

@Injectable({ providedIn: 'root' })
export class ApplicationSelectionService {
  // ── State ──────────────────────────────────────────────────────────────
  private readonly _selectedApp = signal<ApplicationDTO | null>(null);

  /** Cache des applications déjà vues — évite les appels API répétés */
  private readonly _cache = new Map<number, ApplicationDTO>();

  // ── Public API ─────────────────────────────────────────────────────────
  readonly selectedApp   = this._selectedApp.asReadonly();
  readonly selectedAppId = computed(() => this._selectedApp()?.id ?? null);
  readonly hasSelection  = computed(() => this._selectedApp() !== null);

  selectApp(app: ApplicationDTO): void {
    this._cache.set(app.id, app);
    this._selectedApp.set(app);
  }

  clearSelection(): void {
    this._selectedApp.set(null);
  }

  getCached(id: number): ApplicationDTO | undefined {
    return this._cache.get(id);
  }

  putCache(app: ApplicationDTO): void {
    this._cache.set(app.id, app);
  }
}

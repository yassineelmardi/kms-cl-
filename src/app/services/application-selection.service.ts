import { Injectable, signal, computed } from '@angular/core';
import { ApplicationDTO } from '../models/applications.model';

/**
 * ApplicationSelectionService — state management léger (Signals)
 * Gère l'application sélectionnée globalement pour la navigation Keys.
 * Extensible : future recherche autocomplete, breadcrumb, etc.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationSelectionService {
  // ── State ──────────────────────────────────────────────────────────────
  private readonly _selectedApp = signal<ApplicationDTO | null>(null);

  // ── Public API ─────────────────────────────────────────────────────────
  readonly selectedApp   = this._selectedApp.asReadonly();
  readonly selectedAppId = computed(() => this._selectedApp()?.id ?? null);
  readonly hasSelection  = computed(() => this._selectedApp() !== null);

  selectApp(app: ApplicationDTO): void {
    this._selectedApp.set(app);
  }

  clearSelection(): void {
    this._selectedApp.set(null);
  }
}

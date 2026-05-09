import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { ThemeService, ThemeDefinition, ThemeId } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatRippleModule],
  template: `
    <div class="theme-dialog">

      <div class="theme-dialog-header">
        <div class="header-icon-wrap">
          <mat-icon>palette</mat-icon>
        </div>
        <div class="header-text">
          <h2>Thème de l'interface</h2>
          <p>Personnalisez l'apparence de votre espace de travail</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="themes-list">
        @for (theme of themes; track theme.id) {
          <div
            class="theme-card"
            [class.active]="theme.id === currentTheme()"
            matRipple
            (click)="apply(theme.id)"
            [attr.aria-label]="'Activer le thème ' + theme.name"
          >
            <!-- Preview visuel -->
            <div class="theme-preview">
              <!-- Mini sidebar -->
              <div class="preview-sidebar" [style.background]="theme.preview.sidebar">
                <div class="preview-brand-dot" [style.background]="theme.preview.primary"></div>
                @for (i of [1,2,3]; track i) {
                  <div class="preview-nav-item" [class.active-item]="i === 1"
                    [style.background]="i === 1 ? theme.preview.primary + '33' : 'transparent'">
                  </div>
                }
              </div>
              <!-- Mini main -->
              <div class="preview-main" [style.background]="theme.preview.bg">
                <div class="preview-navbar" [style.borderBottomColor]="theme.preview.primary + '30'"></div>
                <div class="preview-content">
                  <div class="preview-card">
                    <div class="preview-bar"
                      [style.background]="theme.preview.primary" style="width:60%"></div>
                    <div class="preview-bar preview-bar--sm"
                      [style.background]="theme.preview.accent + '66'" style="width:40%"></div>
                  </div>
                  <div class="preview-card preview-card--sm">
                    <div class="preview-bar preview-bar--sm"
                      [style.background]="theme.preview.primary + '55'"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Infos -->
            <div class="theme-info">
              <div class="theme-info-left">
                <div class="theme-icon-wrap" [style.background]="theme.preview.primary + '18'">
                  <mat-icon [style.color]="theme.preview.primary">{{ theme.icon }}</mat-icon>
                </div>
                <div>
                  <span class="theme-name">{{ theme.name }}</span>
                  <span class="theme-desc">{{ theme.description }}</span>
                </div>
              </div>
              @if (theme.id === currentTheme()) {
                <div class="theme-active-badge">
                  <mat-icon>check_circle</mat-icon>
                  Actif
                </div>
              }
            </div>
          </div>
        }
      </div>

      <div class="theme-dialog-footer">
        <span class="footer-note">
          <mat-icon>info_outline</mat-icon>
          Le thème est sauvegardé automatiquement
        </span>
        <button mat-stroked-button (click)="close()">Fermer</button>
      </div>

    </div>
  `,
  styles: [`
    .theme-dialog {
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .theme-dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e2e8f0;

      .header-icon-wrap {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon { color: #2563eb; font-size: 22px; width: 22px; height: 22px; }
      }

      .header-text {
        flex: 1;
        h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        p  { font-size: 12px; color: #94a3b8; margin: 2px 0 0; }
      }
    }

    .close-btn { color: #94a3b8; }

    // ── Themes list
    .themes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px 24px;
    }

    .theme-card {
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.18s ease;
      background: #fff;

      &:hover {
        border-color: #93c5fd;
        box-shadow: 0 4px 16px rgba(37,99,235,0.10);
        transform: translateY(-1px);
      }

      &.active {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
      }
    }

    // ── Preview
    .theme-preview {
      display: flex;
      height: 80px;
      overflow: hidden;
      border-bottom: 1px solid #f1f5f9;
    }

    .preview-sidebar {
      width: 52px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 10px 6px;
    }

    .preview-brand-dot {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      margin-bottom: 4px;
    }

    .preview-nav-item {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      opacity: 0.6;
      background: rgba(255,255,255,0.2);
      &.active-item { opacity: 1; }
    }

    .preview-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .preview-navbar {
      height: 18px;
      flex-shrink: 0;
      background: rgba(255,255,255,0.95);
      border-bottom: 1px solid;
    }

    .preview-content {
      flex: 1;
      padding: 6px 8px;
      display: flex;
      gap: 6px;
    }

    .preview-card {
      flex: 1;
      background: rgba(255,255,255,0.7);
      border-radius: 6px;
      border: 1px solid rgba(0,0,0,0.06);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &--sm { max-width: 40%; }
    }

    .preview-bar {
      height: 5px;
      border-radius: 3px;
      &--sm { height: 3px; }
    }

    // ── Theme info row
    .theme-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
    }

    .theme-info-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .theme-name {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .theme-desc {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 1px;
    }

    .theme-active-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #16a34a;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 20px;
      padding: 3px 10px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    // ── Footer
    .theme-dialog-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px 20px;
      border-top: 1px solid #e2e8f0;

      .footer-note {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: #94a3b8;
        mat-icon { font-size: 14px; width: 14px; height: 14px; }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherDialogComponent {
  private readonly themeService = inject(ThemeService);
  private readonly dialogRef = inject(MatDialogRef<ThemeSwitcherDialogComponent>);

  readonly themes: ThemeDefinition[] = this.themeService.themes;
  readonly currentTheme = this.themeService.activeTheme;

  apply(id: ThemeId): void {
    this.themeService.setTheme(id);
  }

  close(): void {
    this.dialogRef.close();
  }
}

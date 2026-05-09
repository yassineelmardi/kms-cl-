import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EnvBadgeComponent } from './components/env-badge/env-badge.component';
import {
  TeamSwitcherDialogComponent,
  TeamProfile,
  TEAM_PROFILES,
} from './components/team-switcher-dialog/team-switcher-dialog.component';
import { ThemeSwitcherDialogComponent } from './components/theme-switcher-dialog/theme-switcher-dialog.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    EnvBadgeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly dialog = inject(MatDialog);
  readonly themeService   = inject(ThemeService);
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly activeProfile    = signal<TeamProfile>(TEAM_PROFILES[0]);

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }

  openTeamSwitcher(): void {
    this.dialog.open(TeamSwitcherDialogComponent, {
      width: '540px', maxHeight: '90vh',
      data: { currentProfileId: this.activeProfile().id },
      panelClass: 'kms-dialog-panel',
    }).afterClosed().subscribe((profile: TeamProfile | null) => {
      if (profile) this.activeProfile.set(profile);
    });
  }

  openThemeSwitcher(): void {
    this.dialog.open(ThemeSwitcherDialogComponent, {
      width: '520px', maxHeight: '90vh',
      panelClass: 'kms-dialog-panel',
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KeysListComponent } from './components/keys-list/keys-list.component';
import { ApplicationsListComponent } from './components/applications-list/applications-list.component';
import {
  TeamSwitcherDialogComponent,
  TeamProfile,
  TEAM_PROFILES,
} from './components/team-switcher-dialog/team-switcher-dialog.component';
import { ThemeSwitcherDialogComponent } from './components/theme-switcher-dialog/theme-switcher-dialog.component';
import { ThemeService } from './services/theme.service';

export type ActivePage = 'keys' | 'applications' | 'certificates';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    KeysListComponent,
    ApplicationsListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly dialog = inject(MatDialog);
  readonly themeService = inject(ThemeService);

  readonly sidebarCollapsed = signal(false);
  readonly activeProfile    = signal<TeamProfile>(TEAM_PROFILES[0]);
  readonly activePage       = signal<ActivePage>('keys');

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }

  navigateTo(page: ActivePage): void { this.activePage.set(page); }

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

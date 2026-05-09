import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KeysListComponent } from './components/keys-list/keys-list.component';
import {
  TeamSwitcherDialogComponent,
  TeamProfile,
  TEAM_PROFILES,
} from './components/team-switcher-dialog/team-switcher-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, KeysListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly dialog = inject(MatDialog);

  readonly sidebarCollapsed = signal(false);
  readonly activeProfile = signal<TeamProfile>(TEAM_PROFILES[0]);

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }

  openTeamSwitcher(): void {
    this.dialog.open(TeamSwitcherDialogComponent, {
      width: '540px',
      maxHeight: '90vh',
      data: { currentProfileId: this.activeProfile().id },
      panelClass: 'kms-dialog-panel',
    }).afterClosed().subscribe((profile: TeamProfile | null) => {
      if (profile) {
        this.activeProfile.set(profile);
      }
    });
  }
}

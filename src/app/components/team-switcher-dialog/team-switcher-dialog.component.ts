import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface TeamProfile {
  id: string;
  name: string;
  role: string;
  team: string;
  initials: string;
  avatarGradient: string;
  icon: string;
  gender: 'male' | 'female';
}

export const TEAM_PROFILES: TeamProfile[] = [
  {
    id: 'ye',
    name: 'Yassine El-Mardi',
    role: 'Administrateur Système',
    team: 'Infrastructure & Sécurité',
    initials: 'YE',
    avatarGradient: 'linear-gradient(135deg, #2563eb, #1e40af)',
    icon: 'manage_accounts',
    gender: 'male',
  },
  {
    id: 'sm',
    name: 'Sophie Martin',
    role: 'Ingénieure Sécurité',
    team: 'Cryptographie & PKI',
    initials: 'SM',
    avatarGradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    icon: 'shield',
    gender: 'female',
  },
  {
    id: 'el',
    name: 'Emma Leclerc',
    role: 'Responsable PKI',
    team: 'Gestion des Certificats',
    initials: 'EL',
    avatarGradient: 'linear-gradient(135deg, #db2777, #f9a8d4)',
    icon: 'verified_user',
    gender: 'female',
  },
  {
    id: 'ad',
    name: 'Alexandre Dupont',
    role: 'Architecte Système',
    team: 'Architecture & Cloud',
    initials: 'AD',
    avatarGradient: 'linear-gradient(135deg, #059669, #6ee7b7)',
    icon: 'architecture',
    gender: 'male',
  },
  {
    id: 'cr',
    name: 'Clara Renaud',
    role: 'Auditrice Sécurité',
    team: 'Compliance & Audit',
    initials: 'CR',
    avatarGradient: 'linear-gradient(135deg, #d97706, #fcd34d)',
    icon: 'fact_check',
    gender: 'female',
  },
  {
    id: 'mb',
    name: 'Marc Besson',
    role: 'DevSecOps Engineer',
    team: 'Intégration Continue',
    initials: 'MB',
    avatarGradient: 'linear-gradient(135deg, #0891b2, #67e8f9)',
    icon: 'terminal',
    gender: 'male',
  },
];

export interface TeamSwitcherDialogData {
  currentProfileId: string;
}

@Component({
  selector: 'app-team-switcher-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatRippleModule],
  template: `
    <div class="switcher-dialog">

      <div class="switcher-header">
        <div class="switcher-header-icon">
          <mat-icon>group</mat-icon>
        </div>
        <div>
          <h2 class="switcher-title">Changer de profil</h2>
          <p class="switcher-subtitle">Sélectionnez un membre de l'équipe</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="profiles-grid">
        @for (profile of profiles; track profile.id) {
          <div
            class="profile-card"
            [class.selected]="profile.id === data.currentProfileId"
            matRipple
            (click)="select(profile)"
          >
            <div class="profile-avatar" [style.background]="profile.avatarGradient">
              {{ profile.initials }}
              @if (profile.id === data.currentProfileId) {
                <div class="avatar-check"><mat-icon>check</mat-icon></div>
              }
            </div>
            <div class="profile-info">
              <span class="profile-name">{{ profile.name }}</span>
              <span class="profile-role">{{ profile.role }}</span>
              <span class="profile-team">
                <mat-icon class="team-icon">{{ profile.icon }}</mat-icon>
                {{ profile.team }}
              </span>
            </div>
            @if (profile.id === data.currentProfileId) {
              <div class="active-badge">Actif</div>
            }
          </div>
        }
      </div>

      <div class="switcher-footer">
        <button mat-stroked-button (click)="close()">Annuler</button>
      </div>

    </div>
  `,
  styles: [`
    .switcher-dialog {
      display: flex;
      flex-direction: column;
      gap: 0;
      font-family: 'Inter', sans-serif;
    }

    .switcher-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e2e8f0;

      .switcher-header-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #eff6ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon { color: #2563eb; font-size: 22px; width: 22px; height: 22px; }
      }

      > div:nth-child(2) { flex: 1; }
    }

    .switcher-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .switcher-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin: 2px 0 0;
    }

    .close-btn {
      color: #94a3b8;
      &:hover { color: #475569; }
    }

    .profiles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 20px 24px;
      max-height: 420px;
      overflow-y: auto;
    }

    .profile-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 16px 12px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.15s ease;
      background: #ffffff;
      text-align: center;

      &:hover {
        border-color: #93c5fd;
        background: #f8fafc;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(37,99,235,0.1);
      }

      &.selected {
        border-color: #2563eb;
        background: #eff6ff;
        box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
      }
    }

    .profile-avatar {
      position: relative;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      color: white;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }

    .avatar-check {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #16a34a;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 10px; width: 10px; height: 10px; color: white; }
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 100%;
    }

    .profile-name {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.2;
    }

    .profile-role {
      font-size: 11px;
      color: #475569;
      font-weight: 500;
    }

    .profile-team {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;

      .team-icon {
        font-size: 11px;
        width: 11px;
        height: 11px;
      }
    }

    .active-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #2563eb;
      background: #dbeafe;
      border-radius: 4px;
      padding: 2px 6px;
    }

    .switcher-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 24px 20px;
      border-top: 1px solid #e2e8f0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSwitcherDialogComponent {
  readonly data = inject<TeamSwitcherDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TeamSwitcherDialogComponent>);

  readonly profiles = TEAM_PROFILES;

  select(profile: TeamProfile): void {
    this.dialogRef.close(profile);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}

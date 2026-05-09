import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-env-badge',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showBadge) {
      <span
        class="env-badge env-badge--{{ env }}"
        [matTooltip]="tooltip"
        matTooltipPosition="below"
      >{{ label }}</span>
    }
  `,
  styles: [`
    .env-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: default;
      user-select: none;

      &--local {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }
      &--dev {
        background: #fef9c3;
        color: #854d0e;
        border: 1px solid #fde047;
        animation: pulse-badge 2.5s infinite;
      }
      &--qa {
        background: #ede9fe;
        color: #5b21b6;
        border: 1px solid #c4b5fd;
      }
      &--uat {
        background: #fce7f3;
        color: #9d174d;
        border: 1px solid #f9a8d4;
      }
      &--prod {
        background: #dcfce7;
        color: #14532d;
        border: 1px solid #86efac;
      }
    }

    @keyframes pulse-badge {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.7; }
    }
  `],
})
export class EnvBadgeComponent {
  readonly env      = environment.name;
  readonly showBadge = environment.name !== 'prod'; // masquer en prod

  get label(): string {
    const labels: Record<string, string> = {
      local: 'LOCAL',
      dev:   'DEV',
      qa:    'QA',
      uat:   'UAT',
      prod:  'PROD',
    };
    return labels[this.env] ?? this.env.toUpperCase();
  }

  get tooltip(): string {
    return `Environnement : ${this.env.toUpperCase()} — ${environment.apiUrl}`;
  }
}

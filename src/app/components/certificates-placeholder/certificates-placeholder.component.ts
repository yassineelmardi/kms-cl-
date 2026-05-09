import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-certificates-placeholder',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="coming-soon">
      <mat-icon>verified_user</mat-icon>
      <h2>Certificats</h2>
      <p>Page Certificats — à venir</p>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--c-text-secondary, #6b7280);
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: .4; }
      h2 { margin: 0; font-size: 1.2rem; font-weight: 600; }
      p { margin: 0; font-size: 0.875rem; }
    }
  `],
})
export class CertificatesPlaceholderComponent {}

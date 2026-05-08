import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeysListComponent } from './components/keys-list/keys-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, KeysListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly sidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
}

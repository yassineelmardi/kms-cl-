import { Component } from '@angular/core';
import { KeysListComponent } from './components/keys-list/keys-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KeysListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Crypto Key Manager';
}

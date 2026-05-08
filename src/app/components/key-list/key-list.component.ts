import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoKeyService } from '../../services/crypto-key.service';
import { CryptoKey } from '../../models/crypto-key.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-key-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-list.component.html',
  styleUrl: './key-list.component.scss'
})
export class KeyListComponent implements OnInit {
  keys$!: Observable<CryptoKey[]>;

  constructor(private cryptoKeyService: CryptoKeyService) {}

  ngOnInit(): void {
    this.keys$ = this.cryptoKeyService.getKeys();
  }

  revokeKey(id: string): void {
    this.cryptoKeyService.revokeKey(id);
  }

  deleteKey(id: string): void {
    this.cryptoKeyService.deleteKey(id);
  }
}

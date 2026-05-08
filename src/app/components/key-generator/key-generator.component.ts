import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoKeyService } from '../../services/crypto-key.service';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent {
  keyName = '';
  selectedAlgorithm = 'RSA-2048';
  algorithms = ['RSA-2048', 'RSA-4096', 'ECDSA-P256', 'ECDSA-P384', 'Ed25519', 'AES-256'];

  constructor(private cryptoKeyService: CryptoKeyService) {}

  generateKey(): void {
    if (this.keyName.trim()) {
      this.cryptoKeyService.generateKey(this.keyName.trim(), this.selectedAlgorithm);
      this.keyName = '';
    }
  }
}

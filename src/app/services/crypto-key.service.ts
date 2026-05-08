import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CryptoKey } from '../models/crypto-key.model';

@Injectable({
  providedIn: 'root'
})
export class CryptoKeyService {
  private keys: CryptoKey[] = [];
  private keysSubject = new BehaviorSubject<CryptoKey[]>([]);

  getKeys(): Observable<CryptoKey[]> {
    return this.keysSubject.asObservable();
  }

  generateKey(name: string, algorithm: string): CryptoKey {
    const newKey: CryptoKey = {
      id: crypto.randomUUID(),
      name,
      algorithm,
      publicKey: this.generateRandomHex(64),
      createdAt: new Date(),
      status: 'active'
    };
    this.keys.push(newKey);
    this.keysSubject.next([...this.keys]);
    return newKey;
  }

  revokeKey(id: string): void {
    const key = this.keys.find(k => k.id === id);
    if (key) {
      key.status = 'revoked';
      this.keysSubject.next([...this.keys]);
    }
  }

  deleteKey(id: string): void {
    this.keys = this.keys.filter(k => k.id !== id);
    this.keysSubject.next([...this.keys]);
  }

  private generateRandomHex(length: number): string {
    const array = new Uint8Array(length / 2);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

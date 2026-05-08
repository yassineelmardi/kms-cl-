export interface CryptoKey {
  id: string;
  name: string;
  algorithm: string;
  publicKey: string;
  createdAt: Date;
  status: 'active' | 'revoked' | 'expired';
}

export type KeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING' | string;
export type KeyType = 'ASYMMETRIC' | 'SYMMETRIC' | string;
export type CertificateStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'NONE' | string;

export interface KeysListDTO {
  id: number;
  status: KeyStatus;
  version: number;
  name: string;
  algorithm: string;
  sizeOrCurve: string;
  certified: boolean;
  hasCertificate: boolean;
  certificateStatus: CertificateStatus;
  type: KeyType;
}

export interface KeyDetailDTO {
  id: number;
  name: string;
  status: string;
  environment: string;
  version: number;
  irn: string;
  sia: string;
  description: string;
  supplier: string;
  createdAt: string;
  createdBy: string;
  templateName: string;
  sizeOrCurve: string;
  usage: number;
  certified: boolean;
  hasCertificate: boolean;
  certificateStatus: string;
  applicationPermissions: number;
  certificateProfile: string;
  certificateId: number;
  algorithm: string;
  type: string;
  exportable: boolean | null;
  encryptionProtocol: string | null;
  deactivationDate: string;
  keyTemplateId: number;
}

export interface PagedKeysListDTO {
  content: KeysListDTO[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

export interface KeysQueryParams {
  applicationId: number | string;
  page?: number;
  size?: number;
  name?: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}

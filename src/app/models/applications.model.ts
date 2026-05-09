export type AppStatus = 'Active' | 'Pending' | 'Draft' | 'Inactive' | string;
export type AppType = 'Internal' | 'External' | 'Partner' | string;

export interface ApplicationDTO {
  id: number;
  irn: string;
  sia: string;
  name: string;
  type: AppType;
  ipn: string;
  status: AppStatus;
  linkedToKeyTemplate: string | null;
}

export interface ApplicationsQueryParams {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
  type?: string;
}

export interface PagedApplicationsDTO {
  content: ApplicationDTO[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

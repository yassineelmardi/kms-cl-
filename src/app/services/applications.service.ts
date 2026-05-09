import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  ApplicationDetailDTO,
  ApplicationsQueryParams,
  PagedApplicationsDTO,
} from '../models/applications.model';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/v1/applications';

  /** Cache LRU simple — évite de re-fetcher un detail déjà chargé */
  private readonly detailCache = new Map<number, ApplicationDetailDTO>();

  getApplications(params: ApplicationsQueryParams = {}): Observable<PagedApplicationsDTO> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 30));

    if (params.name?.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }
    if (params.status?.trim()) {
      httpParams = httpParams.set('status', params.status.trim());
    }
    if (params.type?.trim()) {
      httpParams = httpParams.set('type', params.type.trim());
    }

    return this.http
      .get<PagedApplicationsDTO>(this.apiUrl, { params: httpParams })
      .pipe(catchError(err => throwError(() => err)));
  }

  getApplicationById(id: number): Observable<ApplicationDetailDTO> {
    const cached = this.detailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<ApplicationDetailDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(detail => this.detailCache.set(id, detail)),
        catchError(err => throwError(() => err)),
      );
  }

  clearDetailCache(): void {
    this.detailCache.clear();
  }
}

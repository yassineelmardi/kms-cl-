import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeyDetailDTO, KeysQueryParams, PagedKeysListDTO } from '../models/keys.model';
import { SKIP_ERROR_NOTIFICATION } from '../tokens/http-context.tokens';

const SILENT = { context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true) };

@Injectable({
  providedIn: 'root',
})
export class KeysService {
  private readonly http = inject(HttpClient);

  // Proxied via proxy.conf.json → http://localhost:8083/v1/keys
  private readonly apiUrl = '/v1/keys';

  /**
   * Fetch paginated keys for a given application.
   * Example: GET http://localhost:8083/v1/keys?applicationId=1026&page=0&size=20
   */
  getKeys(params: KeysQueryParams): Observable<PagedKeysListDTO> {
    let httpParams = new HttpParams()
      .set('applicationId', String(params.applicationId))
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 20));

    if (params.name?.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }

    if (params.sortField) {
      const sortDir = params.sortDir ?? 'asc';
      httpParams = httpParams.set('sort', `${params.sortField},${sortDir}`);
    }

    return this.http
      .get<PagedKeysListDTO>(this.apiUrl, { ...SILENT, params: httpParams })
      .pipe(catchError((error) => throwError(() => error)));
  }

  /**
   * Fetch key detail by ID.
   * Example: GET http://localhost:8083/v1/keys/1029
   */
  getKeyById(id: number): Observable<KeyDetailDTO> {
    return this.http
      .get<KeyDetailDTO>(`${this.apiUrl}/${id}`, SILENT)
      .pipe(catchError((error) => throwError(() => error)));
  }

  deleteKey(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, SILENT)
      .pipe(catchError((error) => throwError(() => error)));
  }

  deactivateKey(id: number): Observable<KeyDetailDTO> {
    return this.http
      .patch<KeyDetailDTO>(`${this.apiUrl}/${id}/deactivate`, {}, SILENT)
      .pipe(catchError((error) => throwError(() => error)));
  }
}

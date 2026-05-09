import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'applications',
    pathMatch: 'full',
  },
  {
    path: 'applications',
    loadComponent: () =>
      import('./components/applications-list/applications-list.component').then(
        m => m.ApplicationsListComponent
      ),
  },
  {
    path: 'keys',
    loadComponent: () =>
      import('./components/keys-list/keys-list.component').then(
        m => m.KeysListComponent
      ),
  },
  {
    path: 'applications/:applicationId/keys',
    loadComponent: () =>
      import('./components/keys-list/keys-list.component').then(
        m => m.KeysListComponent
      ),
  },
  {
    path: 'certificates',
    loadComponent: () =>
      import('./components/certificates-placeholder/certificates-placeholder.component').then(
        m => m.CertificatesPlaceholderComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'applications',
  },
];

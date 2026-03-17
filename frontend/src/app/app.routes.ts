import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'dataset',
    loadComponent: () =>
      import('./features/dataset/dataset.component').then(m => m.DatasetComponent),
  },
  {
    path: 'modelo',
    loadComponent: () =>
      import('./features/modelo/modelo.component').then(m => m.ModeloComponent),
  },
  {
    path: 'articulo',
    loadComponent: () =>
      import('./features/articulo/articulo.component').then(m => m.ArticuloComponent),
  },
  {
    path: 'retos',
    loadComponent: () =>
      import('./features/retos/retos.component').then(m => m.RetosComponent),
  },
  {
    path: 'argilla',
    loadComponent: () =>
      import('./features/argilla/argilla.component').then(m => m.ArgillaComponent),
  },
  {
    path: 'pipeline',
    loadComponent: () =>
      import('./features/pipeline/pipeline.component').then(m => m.PipelineComponent),
  },
  {
    path: 'informe',
    loadComponent: () =>
      import('./features/informe/informe.component').then(m => m.InformeComponent),
  },
  {
    path: 'entregables',
    loadComponent: () =>
      import('./features/entregables/entregables.component').then(m => m.EntregablesComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];

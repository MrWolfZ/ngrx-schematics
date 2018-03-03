import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/test',
    pathMatch: 'full',
  },
  {
    path: 'test',
    loadChildren: 'app/test/test.module#TestModule',
  },
];

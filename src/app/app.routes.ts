import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth';
import { LoginGuard } from './auth/guards/login';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./components/users/user.component').then(c => c.UserComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'create',
    loadComponent: () => import('./components/form-user/form-user.component').then(c => c.FormUserComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/form-user/form-user.component').then(c => c.FormUserComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/componentLogin/login.component').then(c => c.LoginComponent),
    canActivate: [LoginGuard] 
  },
  { path: '**', redirectTo: 'login' } 
];

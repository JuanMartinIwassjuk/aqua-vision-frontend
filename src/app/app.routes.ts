import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth';
import { LoginGuard } from './auth/guards/login';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/componentLogin/login.component').then(c => c.LoginComponent),
    canActivate: [LoginGuard] 
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'reportes/diario',
    loadComponent: () => import('./components/reports/reporte-diario/reporte-diario.component').then(c => c.ReporteDiarioComponent),
    canActivate: [AuthGuard] 
  },
  {
  path: 'reportes/historico',
  loadComponent: () => import('./components/reports/reporte-historico/reporte-historico.component').then(m => m.ReporteHistoricoComponent),
 canActivate: [AuthGuard]   
  },
  {
    path: 'consumption-prediction',
    loadComponent: () => import('./components/consumption-prediction/consumption-prediction.component').then(c => c.ConsumptionPredictionComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'consumption-alerts',
    loadComponent: () => import('./components/consumption-alerts/consumption-alerts.component').then(c => c.ConsumptionAlertsComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'gamification',
    loadComponent: () => import('./components/gamification/gamification.component').then(c => c.GamificationComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'account-settings',
    loadComponent: () => import('./components/account-settings/account-settings.component').then(c => c.AccountSettingsComponent),
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: 'login' } 
];

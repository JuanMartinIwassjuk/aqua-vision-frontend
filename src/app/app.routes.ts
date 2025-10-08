import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth';
import { LoginGuard } from './auth/guards/login';
import { GamificationComponent } from './components/gamification/gamification.component';
import { TriviaComponent } from './components/gamification/trivia/trivia.component';
import { AquaSaveComponent } from './components/gamification/aquasave/aquasave.component';
import { MemoryGameComponent } from './components/gamification/memory-test/memory-test.component';
import { DragDropComponent } from './components/gamification/drag-drop/drag-drop.component';

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
  {
    path: 'privacidad',
    loadComponent: () => import('./components/privacidad/privacidad.component').then(c => c.PrivacidadComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'terminos',
    loadComponent: () => import('./components/terminos/terminos.component').then(c => c.TerminosComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: '404',
    loadComponent: () => import('./utils/not-found/not-found.component').then(c => c.NotFoundComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'events',
    loadComponent: () => import('./components/events/event-list/event-list.component').then(c => c.EventListComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'events/create',
    loadComponent: () => import('./components/events/event-form/event-form.component').then(c => c.EventFormComponent),
    canActivate: [AuthGuard] 
  },
  {
    path: 'events/edit/:id',
    loadComponent: () => import('./components/events/edit-form/edit-form.component').then(c => c.EditFormComponent),
    canActivate: [AuthGuard] 
  },
    {
    path: 'events/summary',
    loadComponent: () => import('./components/events/event-graphic/event-graphic.component').then(c => c.EventGraphicComponent),
    canActivate: [AuthGuard] 
  },
  { path: 'gamification', component: GamificationComponent },
  { path: 'gamification/trivia', component: TriviaComponent },
  { path: 'gamification/aquasave', component: AquaSaveComponent },
  { path: 'gamification/memory-test', component: MemoryGameComponent },
  { path: 'gamification/drag-drop', component: DragDropComponent },
  { path: '', redirectTo: 'gamification', pathMatch: 'full' },
  { path: '**', redirectTo: 'gamification' },
  { path: '**', redirectTo: 'login' } 
];

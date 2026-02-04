import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'salary',
    loadComponent: () => import('./salary/salary.component').then((m) => m.SalaryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expense',
    loadComponent: () =>
      import('./add-expense/add-expense.component').then((m) => m.AddExpenseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expense/:id',
    loadComponent: () =>
      import('./add-expense/add-expense.component').then((m) => m.AddExpenseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then((m) => m.HistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'day/:date',
    loadComponent: () => import('./day-details/day-details.component').then((m) => m.DayDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

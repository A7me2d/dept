import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for session check to complete
  while (!auth.sessionChecked()) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for session check to complete
  while (!auth.sessionChecked()) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (auth.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

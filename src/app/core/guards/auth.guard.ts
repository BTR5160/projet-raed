import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard: Ensures the user is authenticated.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login if not authenticated
  return router.createUrlTree(['/login']);
};

/**
 * RoleGuard: Ensures the user has the required role.
 * Expects 'expectedRole' in route data.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.currentUser();

  const expectedRole = route.data['role'];

  if (currentUser && currentUser.role === expectedRole) {
    return true;
  }

  // Redirect to an appropriate dashboard if role doesn't match
  if (currentUser?.role === 'ADMIN') {
    return router.createUrlTree(['/admin-dashboard']);
  } else {
    return router.createUrlTree(['/dashboard']);
  }
};

/**
 * rootRedirectGuard: Redirects from root to role-specific homepage.
 */
export const rootRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.currentUser();

  if (!currentUser) return router.createUrlTree(['/login']);

  if (currentUser.role === 'ADMIN') {
    return router.createUrlTree(['/admin-dashboard']);
  } else {
    return router.createUrlTree(['/scanner']);
  }
};

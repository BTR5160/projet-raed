import { inject } from '@angular/core';import { CanActivateFn, Router } from '@angular/router';import { MockAuthService } from '../services/mock-auth.service';
export const authGuard:CanActivateFn=()=>{const a=inject(MockAuthService);const r=inject(Router);if(a.isAuthenticated())return true;return r.parseUrl('/login');};
export const roleGuard=(role:'AGENT'|'ADMIN'):CanActivateFn=>()=>{const a=inject(MockAuthService);const r=inject(Router);if(a.user()?.role===role)return true;return r.parseUrl(a.user()?.role==='ADMIN'?'/admin/dashboard':'/agent/scan');};

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { delay, Observable, of, tap, throwError } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals for global state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  token = signal<string | null>(null);

  constructor() {
    if (this.isBrowser) {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
        this.isAuthenticated.set(true);
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    if (password === 'error') {
      return throwError(() => new Error('Identifiants invalides')).pipe(delay(1500));
    }

    const mockRole = email.includes('admin') ? 'ADMIN' : 'AGENT';
    
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
      user: {
        id: '1',
        email: email,
        firstName: mockRole === 'ADMIN' ? 'Ahmed' : 'Raed',
        lastName: 'Abid',
        role: mockRole,
        isActive: true,
        avatar: 'assets/avatars/default.png'
      }
    };

    return of(mockResponse).pipe(
      delay(2000),
      tap(res => {
        this.currentUser.set(res.user);
        this.isAuthenticated.set(true);
        this.token.set(res.token);
        if (this.isBrowser) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.token.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }
}


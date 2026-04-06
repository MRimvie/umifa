import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_MANAGER' | 'GRADER' | 'VIEWER';
  schoolId?: string;
  centerId?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals pour la réactivité
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  private readonly TOKEN_KEY = 'umifa_token';
  private readonly USER_KEY = 'umifa_user';

  constructor() {
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Vérifie si l'utilisateur est super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole(['SUPER_ADMIN']);
  }

  /**
   * Vérifie si l'utilisateur est responsable d'école
   */
  isSchoolManager(): boolean {
    return this.hasRole(['SCHOOL_MANAGER']);
  }

  /**
   * Vérifie si l'utilisateur est correcteur
   */
  isGrader(): boolean {
    return this.hasRole(['GRADER']);
  }

  /**
   * Sauvegarde la session
   */
  private setSession(authResult: LoginResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, authResult.access_token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    }
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Charge l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }
}

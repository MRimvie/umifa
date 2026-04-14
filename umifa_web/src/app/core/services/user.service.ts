import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_MANAGER = 'SCHOOL_MANAGER',
  GRADER = 'GRADER'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
  centerId?: string;
  school?: any;
  center?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
  centerId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  schoolId?: string;
  centerId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('users');
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  create(data: CreateUserDto): Observable<User> {
    return this.api.post<User>('users', data);
  }

  update(id: string, data: UpdateUserDto): Observable<User> {
    return this.api.patch<User>(`users/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }

  changePassword(id: string, oldPassword: string, newPassword: string): Observable<void> {
    return this.api.patch<void>(`users/${id}/password`, { oldPassword, newPassword });
  }
}

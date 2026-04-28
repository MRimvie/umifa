import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Subject {
  id: string;
  name: string;
  noteMax: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private api = inject(ApiService);

  getAll(filters?: { includeInactive?: boolean }): Observable<Subject[]> {
    return this.api.get<Subject[]>('subjects', filters);
  }

  create(dto: { name: string; noteMax?: number; isActive?: boolean }): Observable<Subject> {
    return this.api.post<Subject>('subjects', dto);
  }

  update(id: string, dto: { name?: string; noteMax?: number; isActive?: boolean }): Observable<Subject> {
    return this.api.patch<Subject>(`subjects/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`subjects/${id}`);
  }
}

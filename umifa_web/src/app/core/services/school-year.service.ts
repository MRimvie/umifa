import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum SchoolYearStatus {
  INSCRIPTION = 'INSCRIPTION',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

export interface SchoolYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: SchoolYearStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolYearDto {
  year: string;
  startDate: string;
  endDate: string;
  status: SchoolYearStatus;
  isActive?: boolean;
}

export interface UpdateSchoolYearDto {
  year?: string;
  startDate?: string;
  endDate?: string;
  status?: SchoolYearStatus;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolYearService {
  private api = inject(ApiService);

  getAll(): Observable<SchoolYear[]> {
    return this.api.get<SchoolYear[]>('school-years');
  }

  getActive(): Observable<SchoolYear> {
    return this.api.get<SchoolYear>('school-years/active');
  }

  getById(id: string): Observable<SchoolYear> {
    return this.api.get<SchoolYear>(`school-years/${id}`);
  }

  create(data: CreateSchoolYearDto): Observable<SchoolYear> {
    return this.api.post<SchoolYear>('school-years', data);
  }

  update(id: string, data: UpdateSchoolYearDto): Observable<SchoolYear> {
    return this.api.patch<SchoolYear>(`school-years/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`school-years/${id}`);
  }

  setActive(id: string): Observable<SchoolYear> {
    return this.api.patch<SchoolYear>(`school-years/${id}/activate`, {});
  }
}

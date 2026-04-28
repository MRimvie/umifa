import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ExamCenter {
  id: string;
  name: string;
  address: string;
  capacity: number;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamCenterDto {
  name: string;
  address: string;
  capacity: number;
  phone?: string;
}

export interface UpdateExamCenterDto {
  name?: string;
  address?: string;
  capacity?: number;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamCenterService {
  private api = inject(ApiService);

  getAll(): Observable<ExamCenter[]> {
    return this.api.get<ExamCenter[]>('exam-centers');
  }

  getById(id: string): Observable<ExamCenter> {
    return this.api.get<ExamCenter>(`exam-centers/${id}`);
  }

  create(data: CreateExamCenterDto): Observable<ExamCenter> {
    return this.api.post<ExamCenter>('exam-centers', data);
  }

  update(id: string, data: UpdateExamCenterDto): Observable<ExamCenter> {
    return this.api.patch<ExamCenter>(`exam-centers/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`exam-centers/${id}`);
  }
}

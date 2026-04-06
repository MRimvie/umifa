import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { School, SchoolYear, ExamCenter } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private api = inject(ApiService);

  /**
   * Récupère toutes les écoles
   */
  getAll(): Observable<School[]> {
    return this.api.get<School[]>('schools');
  }

  /**
   * Récupère une école par son ID
   */
  getById(id: string): Observable<School> {
    return this.api.get<School>(`schools/${id}`);
  }

  /**
   * Crée une nouvelle école
   */
  create(school: Partial<School>): Observable<School> {
    return this.api.post<School>('schools', school);
  }

  /**
   * Met à jour une école
   */
  update(id: string, school: Partial<School>): Observable<School> {
    return this.api.patch<School>(`schools/${id}`, school);
  }

  /**
   * Supprime une école
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`schools/${id}`);
  }

  /**
   * Récupère toutes les années scolaires
   */
  getAllYears(): Observable<SchoolYear[]> {
    return this.api.get<SchoolYear[]>('school-years');
  }

  /**
   * Récupère l'année scolaire active
   */
  getActiveYear(): Observable<SchoolYear> {
    return this.api.get<SchoolYear>('school-years/active');
  }

  /**
   * Crée une nouvelle année scolaire
   */
  createYear(year: Partial<SchoolYear>): Observable<SchoolYear> {
    return this.api.post<SchoolYear>('school-years', year);
  }

  /**
   * Met à jour une année scolaire
   */
  updateYear(id: string, year: Partial<SchoolYear>): Observable<SchoolYear> {
    return this.api.patch<SchoolYear>(`school-years/${id}`, year);
  }

  /**
   * Récupère tous les centres d'examen
   */
  getAllCenters(): Observable<ExamCenter[]> {
    return this.api.get<ExamCenter[]>('exam-centers');
  }

  /**
   * Crée un nouveau centre d'examen
   */
  createCenter(center: Partial<ExamCenter>): Observable<ExamCenter> {
    return this.api.post<ExamCenter>('exam-centers', center);
  }

  /**
   * Met à jour un centre d'examen
   */
  updateCenter(id: string, center: Partial<ExamCenter>): Observable<ExamCenter> {
    return this.api.patch<ExamCenter>(`exam-centers/${id}`, center);
  }
}

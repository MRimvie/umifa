import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Grade } from '../models/candidate.model';

export interface CandidateResult {
  candidateId: string;
  numeroPV: string | null;
  lastName: string;
  firstName: string;
  gender: string;
  school: { id: string; name: string } | null;
  center: { id: string; name: string } | null;
  grades: { subject: string; score: number; maxScore: number }[];
  totalScore: number | null;
  divisor: number | null;
  average: number | null;
  result: 'ADMIS' | 'AJOURNE' | 'EN_ATTENTE';
  gradesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private api = inject(ApiService);

  /**
   * Récupère toutes les notes avec filtres optionnels
   */
  getAll(filters?: { candidateId?: string; centerId?: string }): Observable<Grade[]> {
    return this.api.get<Grade[]>('grades', filters);
  }

  /**
   * Récupère une note par son ID
   */
  getById(id: string): Observable<Grade> {
    return this.api.get<Grade>(`grades/${id}`);
  }

  /**
   * Crée une nouvelle note
   */
  create(grade: Partial<Grade>): Observable<Grade> {
    return this.api.post<Grade>('grades', grade);
  }

  /**
   * Crée plusieurs notes en masse
   */
  createBulk(grades: Partial<Grade>[]): Observable<{ count: number }> {
    return this.api.post<{ count: number }>('grades/bulk', grades);
  }

  /**
   * Met à jour une note
   */
  update(id: string, grade: Partial<Grade>): Observable<Grade> {
    return this.api.patch<Grade>(`grades/${id}`, grade);
  }

  /**
   * Supprime une note
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`grades/${id}`);
  }

  /**
   * Calcule les résultats d'un candidat
   */
  calculateResults(candidateId: string): Observable<{
    candidateId: string; totalScore: number; divisor: number;
    average: number; result: string; gradesCount: number;
  }> {
    return this.api.post(`grades/calculate/${candidateId}`, {});
  }

  /** Calcule et enregistre toutes les moyennes d'une année */
  calculateAll(params: { schoolYearId: string; centerId?: string }): Observable<{
    processed: number; admis: number; ajourne: number;
  }> {
    return this.api.post('grades/calculate-all', {}, params as Record<string, string>);
  }

  /** Résultats des candidats pour une année */
  getResults(params: { schoolYearId: string; centerId?: string; schoolId?: string }): Observable<CandidateResult[]> {
    return this.api.get<CandidateResult[]>('grades/results', params as Record<string, string>);
  }
}

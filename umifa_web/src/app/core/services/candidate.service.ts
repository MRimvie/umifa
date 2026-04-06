import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Candidate } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private api = inject(ApiService);

  /**
   * Récupère tous les candidats avec filtres optionnels
   */
  getAll(filters?: { schoolYearId?: string; schoolId?: string; centerId?: string }): Observable<Candidate[]> {
    return this.api.get<Candidate[]>('candidates', filters);
  }

  /**
   * Récupère un candidat par son ID
   */
  getById(id: string): Observable<Candidate> {
    return this.api.get<Candidate>(`candidates/${id}`);
  }

  /**
   * Crée un nouveau candidat
   */
  create(candidate: Partial<Candidate>): Observable<Candidate> {
    return this.api.post<Candidate>('candidates', candidate);
  }

  /**
   * Crée plusieurs candidats en masse
   */
  createBulk(candidates: Partial<Candidate>[]): Observable<{ count: number }> {
    return this.api.post<{ count: number }>('candidates/bulk', candidates);
  }

  /**
   * Met à jour un candidat
   */
  update(id: string, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.api.patch<Candidate>(`candidates/${id}`, candidate);
  }

  /**
   * Supprime un candidat
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`candidates/${id}`);
  }

  /**
   * Affecte des candidats à un centre d'examen
   */
  assignCenter(candidateIds: string[], centerId: string): Observable<{ count: number }> {
    return this.api.post<{ count: number }>('candidates/assign-center', { candidateIds, centerId });
  }

  /**
   * Génère les numéros PV pour une année scolaire
   */
  generatePV(schoolYearId: string): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>(`candidates/generate-pv/${schoolYearId}`, {});
  }
}

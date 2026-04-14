import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolService } from '../../core/services/school.service';
import { SchoolYearService, SchoolYear } from '../../core/services/school-year.service';
import { Candidate, School } from '../../core/models/candidate.model';

interface CandidateFormData {
  firstName: string;
  lastName: string;
  gender: 'MASCULIN' | 'FEMININ';
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  schoolId: string;
  schoolYearId: string;
  numeroPV?: string;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private schoolService = inject(SchoolService);
  private schoolYearService = inject(SchoolYearService);
  
  candidates = signal<Candidate[]>([]);
  schools = signal<School[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedCandidate = signal<Candidate | null>(null);
  
  formData = signal<CandidateFormData>({
    firstName: '',
    lastName: '',
    gender: 'MASCULIN',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Française',
    schoolId: '',
    schoolYearId: '',
    numeroPV: ''
  });

  ngOnInit(): void {
    this.loadCandidates();
    this.loadSchools();
    this.loadSchoolYears();
  }

  loadCandidates(): void {
    this.loading.set(true);
    this.candidateService.getAll().subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement candidats', err);
        this.loading.set(false);
      }
    });
  }

  loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => this.schools.set(data),
      error: (err) => console.error('Erreur chargement écoles', err)
    });
  }

  loadSchoolYears(): void {
    this.schoolYearService.getAll().subscribe({
      next: (data) => this.schoolYears.set(data),
      error: (err) => console.error('Erreur chargement années', err)
    });
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      firstName: '',
      lastName: '',
      gender: 'MASCULIN',
      dateOfBirth: '',
      placeOfBirth: '',
      nationality: 'Française',
      schoolId: '',
      schoolYearId: '',
      numeroPV: ''
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(candidate: Candidate): void {
    this.editMode.set(true);
    this.selectedCandidate.set(candidate);
    this.formData.set({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      gender: candidate.gender as 'MASCULIN' | 'FEMININ',
      dateOfBirth: candidate.dateOfBirth.split('T')[0],
      placeOfBirth: candidate.placeOfBirth,
      nationality: candidate.nationality,
      schoolId: candidate.schoolId,
      schoolYearId: candidate.schoolYearId,
      numeroPV: candidate.numeroPV || ''
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedCandidate.set(null);
  }

  saveCandidate(): void {
    this.loading.set(true);
    
    if (this.editMode() && this.selectedCandidate()) {
      this.candidateService.update(this.selectedCandidate()!.id, this.formData()).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour candidat', err);
          this.loading.set(false);
        }
      });
    } else {
      this.candidateService.create(this.formData()).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création candidat', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteCandidate(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      this.loading.set(true);
      this.candidateService.delete(id).subscribe({
        next: () => this.loadCandidates(),
        error: (err) => {
          console.error('Erreur suppression candidat', err);
          this.loading.set(false);
        }
      });
    }
  }
}

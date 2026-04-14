import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeService } from '../../core/services/grade.service';
import { CandidateService } from '../../core/services/candidate.service';
import { Grade } from '../../core/models/candidate.model';

interface GradeFormData {
  candidateId: string;
  subject: string;
  score: number;
  maxScore: number;
  comments?: string;
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})
export class GradesComponent implements OnInit {
  private gradeService = inject(GradeService);
  private candidateService = inject(CandidateService);
  
  grades = signal<Grade[]>([]);
  candidates = signal<any[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedGrade = signal<Grade | null>(null);
  
  formData = signal<GradeFormData>({
    candidateId: '',
    subject: '',
    score: 0,
    maxScore: 20,
    comments: ''
  });

  subjects = [
    'Coran',
    'Tajwid',
    'Fiqh',
    'Hadith',
    'Langue Arabe',
    'Histoire Islamique',
    'Sira'
  ];

  ngOnInit(): void {
    this.loadGrades();
    this.loadCandidates();
  }

  loadGrades(): void {
    this.loading.set(true);
    this.gradeService.getAll().subscribe({
      next: (data) => {
        this.grades.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement notes', err);
        this.loading.set(false);
      }
    });
  }

  loadCandidates(): void {
    this.candidateService.getAll().subscribe({
      next: (data) => this.candidates.set(data),
      error: (err) => console.error('Erreur chargement candidats', err)
    });
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      candidateId: '',
      subject: '',
      score: 0,
      maxScore: 20,
      comments: ''
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(grade: Grade): void {
    this.editMode.set(true);
    this.selectedGrade.set(grade);
    this.formData.set({
      candidateId: grade.candidateId,
      subject: grade.subject,
      score: grade.score,
      maxScore: grade.maxScore,
      comments: grade.comments || ''
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedGrade.set(null);
  }

  saveGrade(): void {
    this.loading.set(true);
    
    if (this.editMode() && this.selectedGrade()) {
      this.gradeService.update(this.selectedGrade()!.id, this.formData()).subscribe({
        next: () => {
          this.loadGrades();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour note', err);
          this.loading.set(false);
        }
      });
    } else {
      this.gradeService.create(this.formData()).subscribe({
        next: () => {
          this.loadGrades();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création note', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteGrade(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.loading.set(true);
      this.gradeService.delete(id).subscribe({
        next: () => this.loadGrades(),
        error: (err) => {
          console.error('Erreur suppression note', err);
          this.loading.set(false);
        }
      });
    }
  }

  getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  }
}

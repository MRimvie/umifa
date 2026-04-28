import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GradeService } from '../../core/services/grade.service';
import { CandidateService } from '../../core/services/candidate.service';
import { Grade } from '../../core/models/candidate.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { ExamCenterService, ExamCenter } from '../../core/services/exam-center.service';
import { SubjectService, Subject } from '../../core/services/subject.service';

interface GradeFormData {
  candidateId: string;
  subject: string;
  score: number;
  maxScore: number;
  comments?: string;
}

type CandidateRow = {
  candidateId: string;
  firstName: string;
  lastName: string;
  centerName: string;
  schoolName: string;
  gradesBySubject: Record<string, Grade | undefined>;
};

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})
export class GradesComponent implements OnInit {
  private gradeService = inject(GradeService);
  private candidateService = inject(CandidateService);
  private examCenterService = inject(ExamCenterService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);
  
  grades = signal<Grade[]>([]);
  candidates = signal<any[]>([]);
  centers = signal<ExamCenter[]>([]);
  subjects = signal<Subject[]>([]);

  selectedCenterId = signal<string>('');

  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedGrade = signal<Grade | null>(null);

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedRow = signal<CandidateRow | null>(null);

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  private dialogConfirmAction: (() => void) | null = null;

  private openDialog(params: {
    title: string;
    message: string;
    variant: 'info' | 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  }): void {
    this.dialogTitle.set(params.title);
    this.dialogMessage.set(params.message);
    this.dialogVariant.set(params.variant);
    this.dialogConfirmAction = params.onConfirm ?? null;
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.dialogConfirmAction = null;
  }

  confirmDialog(): void {
    const action = this.dialogConfirmAction;
    this.closeDialog();
    action?.();
  }
  
  formData = signal<GradeFormData>({
    candidateId: '',
    subject: '',
    score: 0,
    maxScore: 20,
    comments: ''
  });

  displayedSubjects = computed(() => this.subjects().filter((s) => s.isActive).slice(0, 4));

  private gradeValueDrafts = signal<Record<string, number | ''>>({});

  candidateRows = computed<CandidateRow[]>(() => {
    const candidates = this.candidates();
    const grades = this.grades();
    const subjects = this.displayedSubjects();

    const gradesByCandidate: Record<string, Grade[]> = {};
    for (const g of grades) {
      (gradesByCandidate[g.candidateId] ||= []).push(g);
    }

    return candidates.map((c) => {
      const candidateGrades = gradesByCandidate[c.id] ?? [];
      const map: Record<string, Grade | undefined> = {};
      for (const s of subjects) {
        map[s.name] = candidateGrades.find((g) => g.subject === s.name);
      }

      return {
        candidateId: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        centerName: c.center?.name || '',
        schoolName: c.school?.name || '',
        gradesBySubject: map,
      };
    });
  });

  openMobileDetails(row: CandidateRow): void {
    this.mobileSelectedRow.set(row);
    this.mobileSheetOpen.set(true);
  }

  openCandidateDetails(row: CandidateRow): void {
    this.router.navigate(['/grades/candidate', row.candidateId]);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

  ngOnInit(): void {
    this.loadCenters();
    this.loadSubjects();
    this.refreshCenterData();
  }

  loadCenters(): void {
    this.examCenterService.getAll().subscribe({
      next: (data) => this.centers.set(data),
      error: (err) => console.error('Erreur chargement centres', err),
    });
  }

  loadSubjects(): void {
    this.subjectService.getAll().subscribe({
      next: (data) => this.subjects.set(data),
      error: (err) => console.error('Erreur chargement matières', err),
    });
  }

  onSelectCenter(centerId: string): void {
    this.selectedCenterId.set(centerId);
    this.pageIndex.set(0);
    this.refreshCenterData();
  }

  refreshCenterData(): void {
    const centerId = this.selectedCenterId();
    this.loading.set(true);

    const candidateParams = centerId ? { centerId } : undefined;
    const gradesParams = centerId ? { centerId } : undefined;

    this.candidateService.getAll(candidateParams as any).subscribe({
      next: (cands) => {
        this.candidates.set(cands);
        this.gradeService.getAll(gradesParams as any).subscribe({
          next: (grades) => {
            this.grades.set(grades);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Erreur chargement notes', err);
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erreur chargement candidats', err);
        this.loading.set(false);
      },
    });
  }

  setPageIndex(next: number): void {
    this.pageIndex.set(next);
  }

  setPageSize(next: number): void {
    this.pageSize.set(next);
    this.pageIndex.set(0);
  }

  get pagedRows(): CandidateRow[] {
    const start = this.pageIndex() * this.pageSize();
    return this.candidateRows().slice(start, start + this.pageSize());
  }

  draftKey(candidateId: string, subject: string): string {
    return `${candidateId}::${subject}`;
  }

  getDraftValue(candidateId: string, subject: string, existing?: Grade): number | '' {
    const key = this.draftKey(candidateId, subject);
    const d = this.gradeValueDrafts()[key];
    if (d === 0 || d) return d;
    if (d === '') return '';
    return typeof existing?.score === 'number' ? existing.score : '';
  }

  setDraftValue(candidateId: string, subject: string, value: number | ''): void {
    const key = this.draftKey(candidateId, subject);
    this.gradeValueDrafts.set({ ...this.gradeValueDrafts(), [key]: value });
  }

  saveInlineGrade(candidateId: string, subject: string, existing?: Grade): void {
    const key = this.draftKey(candidateId, subject);
    const value = this.gradeValueDrafts()[key];
    if (value === '' || value === undefined) return;

    const score = Number(value);
    if (Number.isNaN(score)) return;

    this.loading.set(true);

    if (existing?.id) {
      this.gradeService.update(existing.id, { score, subject, candidateId, maxScore: existing.maxScore ?? 20 }).subscribe({
        next: () => this.refreshCenterData(),
        error: (err) => {
          console.error('Erreur mise à jour note', err);
          this.loading.set(false);
        },
      });
      return;
    }

    this.gradeService.create({ candidateId, subject, score, maxScore: 20 }).subscribe({
      next: () => this.refreshCenterData(),
      error: (err) => {
        console.error('Erreur création note', err);
        this.loading.set(false);
      },
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
          this.refreshCenterData();
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
          this.refreshCenterData();
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
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette note ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.gradeService.delete(id).subscribe({
          next: () => this.refreshCenterData(),
          error: (err) => {
            console.error('Erreur suppression note', err);
            const message = err?.error?.message || 'Erreur lors de la suppression de la note.';
            this.openDialog({
              title: 'Suppression impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }

  getPercentage(score: number, maxScore: number): number {
    if (!maxScore) return 0;
    return Math.round((score / maxScore) * 100);
  }

  getScoreColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  }
}

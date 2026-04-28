import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CandidateService } from '../../core/services/candidate.service';
import { GradeService } from '../../core/services/grade.service';
import { SubjectService, Subject } from '../../core/services/subject.service';
import { Candidate, Grade } from '../../core/models/candidate.model';

@Component({
  selector: 'app-grade-candidate-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './grade-candidate-details.component.html',
  styleUrls: ['./grade-candidate-details.component.scss'],
})
export class GradeCandidateDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateService = inject(CandidateService);
  private gradeService = inject(GradeService);
  private subjectService = inject(SubjectService);

  candidateId = signal('');

  loading = signal(false);
  candidate = signal<Candidate | null>(null);
  grades = signal<Grade[]>([]);
  subjects = signal<Subject[]>([]);

  activeSubjects = computed(() => this.subjects().filter((s) => s.isActive));

  private gradeValueDrafts = signal<Record<string, number | ''>>({});

  gradesBySubject = computed<Record<string, Grade | undefined>>(() => {
    const map: Record<string, Grade | undefined> = {};
    for (const g of this.grades()) {
      map[g.subject] = g;
    }
    return map;
  });

  ngOnInit(): void {
    const id = String(this.route.snapshot.paramMap.get('id') || '');
    this.candidateId.set(id);
    this.refresh();
  }

  goBack(): void {
    this.router.navigate(['/grades']);
  }

  refresh(): void {
    const id = this.candidateId();
    if (!id) return;

    this.loading.set(true);

    this.subjectService.getAll().subscribe({
      next: (subjects) => {
        this.subjects.set(subjects);
        this.candidateService.getById(id).subscribe({
          next: (cand) => {
            this.candidate.set(cand);
            this.gradeService.getAll({ candidateId: id }).subscribe({
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
            console.error('Erreur chargement candidat', err);
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erreur chargement matières', err);
        this.loading.set(false);
      },
    });
  }

  draftKey(subject: string): string {
    return `${this.candidateId()}::${subject}`;
  }

  getDraftValue(subject: string, existing?: Grade): number | '' {
    const key = this.draftKey(subject);
    const d = this.gradeValueDrafts()[key];
    if (d === 0 || d) return d;
    if (d === '') return '';
    return typeof existing?.score === 'number' ? existing.score : '';
  }

  setDraftValue(subject: string, value: number | '', noteMax?: number): void {
    const key = this.draftKey(subject);
    const clamped = (value !== '' && noteMax !== undefined && Number(value) > noteMax)
      ? noteMax
      : value;
    this.gradeValueDrafts.set({ ...this.gradeValueDrafts(), [key]: clamped });
  }

  saveInline(subject: string, existing?: Grade): void {
    const key = this.draftKey(subject);
    const value = this.gradeValueDrafts()[key];
    if (value === '' || value === undefined) return;

    const score = Number(value);
    if (Number.isNaN(score)) return;

    const subjectNoteMax = this.subjects().find((s) => s.name === subject)?.noteMax ?? 20;
    const candidateId = this.candidateId();
    this.loading.set(true);

    if (existing?.id) {
      this.gradeService
        .update(existing.id, {
          candidateId,
          subject,
          score,
          maxScore: existing.maxScore ?? subjectNoteMax,
        })
        .subscribe({
          next: () => this.refresh(),
          error: (err) => {
            console.error('Erreur mise à jour note', err);
            this.loading.set(false);
          },
        });
      return;
    }

    this.gradeService
      .create({
        candidateId,
        subject,
        score,
        maxScore: subjectNoteMax,
      })
      .subscribe({
        next: () => this.refresh(),
        error: (err) => {
          console.error('Erreur création note', err);
          this.loading.set(false);
        },
      });
  }
}

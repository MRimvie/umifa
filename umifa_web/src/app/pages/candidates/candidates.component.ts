import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolService } from '../../core/services/school.service';
import { SchoolYearService, SchoolYear } from '../../core/services/school-year.service';
import { Candidate, School } from '../../core/models/candidate.model';
import { ExamCenterService, ExamCenter } from '../../core/services/exam-center.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';

interface CandidateFormData {
  firstName: string;
  lastName: string;
  gender: 'MASCULIN' | 'FEMININ';
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  schoolId: string;
  schoolYearId: string;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private schoolService = inject(SchoolService);
  private schoolYearService = inject(SchoolYearService);
  private examCenterService = inject(ExamCenterService);
  
  candidates = signal<Candidate[]>([]);
  schools = signal<School[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  activeSchoolYear = signal<SchoolYear | null>(null);
  centers = signal<ExamCenter[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedCandidate = signal<Candidate | null>(null);

  selectedSchoolYearIdFilter = signal<string>('');
  selectedCenterIdFilter = signal<string>('');

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedCandidate = signal<Candidate | null>(null);

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  dialogItems = signal<string[]>([]);
  private dialogConfirmAction: (() => void) | null = null;

  openMobileDetails(candidate: Candidate): void {
    this.mobileSelectedCandidate.set(candidate);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }
  
  formData = signal<CandidateFormData>({
    firstName: '',
    lastName: '',
    gender: 'MASCULIN',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Burkinabé',
    schoolId: '',
    schoolYearId: ''
  });

  ngOnInit(): void {
    this.loadCandidates();
    this.loadSchools();
    this.loadSchoolYears();
    this.loadActiveSchoolYear();
    this.loadCenters();
  }

  private openDialog(params: {
    title: string;
    message: string;
    variant: 'info' | 'success' | 'error' | 'confirm';
    items?: string[];
    onConfirm?: () => void;
  }): void {
    this.dialogTitle.set(params.title);
    this.dialogMessage.set(params.message);
    this.dialogVariant.set(params.variant);
    this.dialogItems.set(params.items ?? []);
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

  loadCandidates(): void {
    this.loading.set(true);
    const filters = {
      schoolYearId: this.selectedSchoolYearIdFilter() || undefined,
      centerId: this.selectedCenterIdFilter() || undefined,
    };

    this.candidateService.getAll(filters).subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.pageIndex.set(0);
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

  loadActiveSchoolYear(): void {
    this.schoolYearService.getActive().subscribe({
      next: (data) => this.activeSchoolYear.set(data),
      error: (err) => {
        console.error('Erreur chargement année active', err);
        this.activeSchoolYear.set(null);
      }
    });
  }

  loadCenters(): void {
    this.examCenterService.getAll().subscribe({
      next: (data) => this.centers.set(data),
      error: (err) => console.error('Erreur chargement centres', err),
    });
  }

  onChangeFilters(): void {
    this.loadCandidates();
  }

  setPageIndex(next: number): void {
    this.pageIndex.set(next);
  }

  setPageSize(next: number): void {
    this.pageSize.set(next);
    this.pageIndex.set(0);
  }

  get pagedCandidates(): Candidate[] {
    const start = this.pageIndex() * this.pageSize();
    return this.candidates().slice(start, start + this.pageSize());
  }

  distributeCandidates(): void {
    const year = this.activeSchoolYear();
    if (!year) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Aucune année scolaire active trouvée.',
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Répartition automatique',
      message: `Répartir automatiquement les candidats de ${year.year} dans les centres ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.distributeCandidates(year.id).subscribe({
          next: (res) => {
            const items = (res.assignments ?? [])
              .slice(0, 50)
              .map((a) => `${a.candidate.lastName} ${a.candidate.firstName} → ${a.center.name}`);

            this.openDialog({
              title: 'Répartition effectuée',
              message: res.message,
              variant: 'success',
              items,
            });
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Erreur répartition candidats', err);
            const message = err?.error?.message || 'Erreur lors de la répartition des candidats.';
            this.openDialog({
              title: 'Répartition impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }

  generatePV(): void {
    const year = this.activeSchoolYear();
    if (!year) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Aucune année scolaire active trouvée.',
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Génération des numéros PV',
      message: `Générer les numéros PV pour les candidats affectés de ${year.year} ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.generatePV(year.id).subscribe({
          next: (res) => {
            const items = (res.pvAssignments ?? [])
              .slice(0, 50)
              .map((p) => `${p.candidate.lastName} ${p.candidate.firstName} → ${p.numeroPV}`);
            this.openDialog({
              title: 'PV attribués',
              message: res.message,
              variant: 'success',
              items,
            });
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Erreur génération PV', err);
            const message = err?.error?.message
              || "Impossible de générer les numéros PV. Affectez d'abord les candidats à un centre.";
            this.openDialog({
              title: 'Génération PV impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
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
      nationality: 'Burkinabé',
      schoolId: '',
      schoolYearId: ''
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
      schoolYearId: candidate.schoolYearId
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
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce candidat ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.delete(id).subscribe({
          next: () => this.loadCandidates(),
          error: (err) => {
            console.error('Erreur suppression candidat', err);
            const message = err?.error?.message || 'Erreur lors de la suppression du candidat.';
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
}

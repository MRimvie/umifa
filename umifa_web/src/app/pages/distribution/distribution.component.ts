import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolYearService, SchoolYear } from '../../core/services/school-year.service';
import { SchoolService } from '../../core/services/school.service';
import { School } from '../../core/models/candidate.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { TranslateModule } from '@ngx-translate/core';

type DistributionCenterItem = {
  id: string;
  name: string;
  capacity: number;
  assigned: number;
  remaining: number | null;
};

type DistributionResponse = {
  schoolYear: { id: string; year: string };
  unassignedCount: number;
  missingPvCount: number;
  centers: DistributionCenterItem[];
};

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent, TranslateModule],
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss'],
})
export class DistributionComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private schoolYearService = inject(SchoolYearService);
  private schoolService = inject(SchoolService);

  loading = signal(false);

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  dialogItems = signal<string[]>([]);
  private dialogConfirmAction: (() => void) | null = null;

  schoolYears = signal<SchoolYear[]>([]);
  activeSchoolYear = signal<SchoolYear | null>(null);
  selectedSchoolYearId = signal<string>('');

  schools = signal<School[]>([]);
  selectedCenterId = signal<string>('');
  selectedSchoolIds = signal<string[]>([]);

  centerQuery = signal('');
  schoolQuery = signal('');
  centerDropdownOpen = signal(false);
  schoolDropdownOpen = signal(false);

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedCenter = signal<DistributionCenterItem | null>(null);

  distribution = signal<DistributionResponse | null>(null);

  openMobileDetails(center: DistributionCenterItem): void {
    this.mobileSelectedCenter.set(center);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

  setPageIndex(next: number): void {
    this.pageIndex.set(next);
  }

  setPageSize(next: number): void {
    this.pageSize.set(next);
    this.pageIndex.set(0);
  }

  get pagedCenters(): DistributionCenterItem[] {
    const d = this.distribution();
    if (!d) return [];
    const start = this.pageIndex() * this.pageSize();
    return d.centers.slice(start, start + this.pageSize());
  }

  get filteredCenters(): DistributionCenterItem[] {
    const d = this.distribution();
    if (!d) return [];
    const q = this.centerQuery().trim().toLowerCase();
    if (!q) return d.centers;
    return d.centers.filter((c) => c.name.toLowerCase().includes(q));
  }

  get filteredSchools(): School[] {
    const q = this.schoolQuery().trim().toLowerCase();
    if (!q) return this.schools();
    return this.schools().filter((s) => s.name.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.loadSchoolYears();
    this.loadActiveSchoolYear();
    this.loadSchools();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.centerDropdownOpen.set(false);
    this.schoolDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const within = (selector: string) => !!target.closest(selector);

    if (!within('[data-center-dropdown]')) {
      this.centerDropdownOpen.set(false);
    }
    if (!within('[data-school-dropdown]')) {
      this.schoolDropdownOpen.set(false);
    }
  }

  openCenterDropdown(): void {
    this.centerDropdownOpen.set(true);
  }

  openSchoolDropdown(): void {
    this.schoolDropdownOpen.set(true);
  }

  selectCenter(centerId: string): void {
    this.selectedCenterId.set(centerId);
    this.centerDropdownOpen.set(false);
  }

  get selectedCenterLabel(): string {
    const id = this.selectedCenterId();
    if (!id) return '';
    return this.distribution()?.centers.find((c) => c.id === id)?.name ?? '';
  }

  get selectedSchoolsLabel(): string {
    const ids = this.selectedSchoolIds();
    if (ids.length === 0) return '';
    if (ids.length === 1) {
      return this.schools().find((s) => s.id === ids[0])?.name ?? '';
    }
    return `${ids.length} école(s) sélectionnée(s)`;
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

  loadSchoolYears(): void {
    this.schoolYearService.getAll().subscribe({
      next: (data) => this.schoolYears.set(data),
      error: (err) => console.error('Erreur chargement années', err),
    });
  }

  loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => this.schools.set(data),
      error: (err) => console.error('Erreur chargement écoles', err),
    });
  }

  toggleSchoolSelection(schoolId: string): void {
    const current = this.selectedSchoolIds();
    if (current.includes(schoolId)) {
      this.selectedSchoolIds.set(current.filter((id) => id !== schoolId));
      return;
    }
    this.selectedSchoolIds.set([...current, schoolId]);
  }

  clearManualSelection(): void {
    this.selectedCenterId.set('');
    this.selectedSchoolIds.set([]);
  }

  applySchoolToCenter(): void {
    const yearId = this.selectedSchoolYearId();
    const centerId = this.selectedCenterId();
    const schoolIds = this.selectedSchoolIds();

    if (!yearId) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Veuillez sélectionner une année scolaire.',
        variant: 'error',
      });
      return;
    }

    if (!centerId) {
      this.openDialog({
        title: 'Centre',
        message: "Veuillez sélectionner un centre d'examen.",
        variant: 'error',
      });
      return;
    }

    if (schoolIds.length === 0) {
      this.openDialog({
        title: 'Écoles',
        message: 'Veuillez sélectionner au moins une école.',
        variant: 'error',
      });
      return;
    }

    const centerName = this.distribution()?.centers.find((c) => c.id === centerId)?.name ?? 'centre sélectionné';
    const selectedSchools = this.schools().filter((s) => schoolIds.includes(s.id));
    const schoolNames = selectedSchools.map((s) => s.name);

    this.openDialog({
      title: 'Affectation manuelle',
      message: `Affecter tous les candidats des écoles sélectionnées au ${centerName} ?`,
      variant: 'confirm',
      items: schoolNames.slice(0, 50),
      onConfirm: () => {
        this.loading.set(true);

        const requests = schoolIds.map((schoolId) =>
          this.candidateService.getAll({ schoolYearId: yearId, schoolId }),
        );

        const candidates$ = requests.length > 0 ? forkJoin(requests) : of([]);

        candidates$
          .pipe(
            switchMap((lists) => {
              const all = lists.flat();
              const candidateIds = Array.from(new Set(all.map((c) => c.id)));
              if (candidateIds.length === 0) {
                return of({ count: 0 });
              }
              return this.candidateService.assignCenter(candidateIds, centerId);
            }),
          )
          .subscribe({
            next: (res) => {
              this.openDialog({
                title: 'Affectation effectuée',
                message: `${res.count} candidat(s) affecté(s) au ${centerName}.`,
                variant: 'success',
                items: schoolNames.slice(0, 50),
              });
              this.clearManualSelection();
              this.refresh();
            },
            error: (err) => {
              console.error('Erreur affectation manuelle', err);
              const message = err?.error?.message || "Erreur lors de l'affectation manuelle.";
              this.openDialog({
                title: 'Affectation impossible',
                message,
                variant: 'error',
              });
              this.loading.set(false);
            },
          });
      },
    });
  }

  loadActiveSchoolYear(): void {
    this.schoolYearService.getActive().subscribe({
      next: (data) => {
        this.activeSchoolYear.set(data);
        this.selectedSchoolYearId.set(data.id);
        this.refresh();
      },
      error: (err) => {
        console.error('Erreur chargement année active', err);
        this.activeSchoolYear.set(null);
      },
    });
  }

  refresh(): void {
    const yearId = this.selectedSchoolYearId();
    if (!yearId) return;

    this.loading.set(true);
    this.candidateService.getDistribution(yearId).subscribe({
      next: (data) => {
        this.distribution.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement distribution', err);
        this.loading.set(false);
      },
    });
  }

  distribute(): void {
    const yearId = this.selectedSchoolYearId();
    const yearLabel = this.schoolYears().find((y) => y.id === yearId)?.year ?? '';

    if (!yearId) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Veuillez sélectionner une année scolaire.',
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Répartition automatique',
      message: `Lancer la répartition automatique pour ${yearLabel} ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.distributeCandidates(yearId).subscribe({
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
            this.refresh();
          },
          error: (err) => {
            console.error('Erreur répartition automatique', err);
            const message = err?.error?.message || 'Erreur lors de la répartition automatique.';
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
    const yearId = this.selectedSchoolYearId();
    const yearLabel = this.schoolYears().find((y) => y.id === yearId)?.year ?? '';
    const unassignedCount = this.distribution()?.unassignedCount ?? null;

    if (!yearId) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Veuillez sélectionner une année scolaire.',
        variant: 'error',
      });
      return;
    }

    if (unassignedCount !== null && unassignedCount > 0) {
      this.openDialog({
        title: 'Affectation requise',
        message: `Impossible de générer les numéros PV : ${unassignedCount} candidat(s) ne sont pas affecté(s) à un centre. Veuillez d'abord affecter tous les candidats à un ou des centres, puis réessayer.`,
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Génération des numéros PV',
      message: `Générer les numéros PV pour les candidats affectés (${yearLabel}) ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.generatePV(yearId).subscribe({
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
            this.refresh();
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
}

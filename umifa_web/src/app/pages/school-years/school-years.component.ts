import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolYearService, SchoolYear, CreateSchoolYearDto, SchoolYearStatus } from '../../core/services/school-year.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-school-years',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent],
  templateUrl: './school-years.component.html',
  styleUrls: ['./school-years.component.scss']
})
export class SchoolYearsComponent implements OnInit {
  private schoolYearService = inject(SchoolYearService);
  
  years = signal<SchoolYear[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedYear = signal<SchoolYear | null>(null);

  yearFilter = signal('');
  statusFilter = signal<string>('');
  activeOnly = signal<boolean>(false);

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedYear = signal<SchoolYear | null>(null);

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
  
  formData = signal<CreateSchoolYearDto>({
    year: '',
    startDate: '',
    endDate: '',
    status: SchoolYearStatus.INSCRIPTION,
    isActive: false
  });

  openMobileDetails(year: SchoolYear): void {
    this.mobileSelectedYear.set(year);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

  statusOptions = [
    { value: SchoolYearStatus.INSCRIPTION, label: 'Inscription', color: 'blue' },
    { value: SchoolYearStatus.EN_COURS, label: 'En cours', color: 'green' },
    { value: SchoolYearStatus.TERMINEE, label: 'Terminée', color: 'gray' }
  ];

  ngOnInit(): void {
    this.loadYears();
  }

  loadYears(): void {
    this.loading.set(true);
    this.schoolYearService.getAll().subscribe({
      next: (data) => {
        this.years.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement années', err);
        this.loading.set(false);
      }
    });
  }

  setPageIndex(next: number): void {
    this.pageIndex.set(next);
  }

  setPageSize(next: number): void {
    this.pageSize.set(next);
    this.pageIndex.set(0);
  }

  onChangeFilters(): void {
    this.pageIndex.set(0);
  }

  get filteredYears(): SchoolYear[] {
    const q = this.yearFilter().trim().toLowerCase();
    const status = this.statusFilter();
    const activeOnly = this.activeOnly();

    return this.years().filter((y) => {
      if (q && !y.year.toLowerCase().includes(q)) return false;
      if (status && y.status !== status) return false;
      if (activeOnly && !y.isActive) return false;
      return true;
    });
  }

  get pagedYears(): SchoolYear[] {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredYears.slice(start, start + this.pageSize());
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      year: '',
      startDate: '',
      endDate: '',
      status: SchoolYearStatus.INSCRIPTION,
      isActive: false
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(year: SchoolYear): void {
    this.editMode.set(true);
    this.selectedYear.set(year);
    this.formData.set({
      year: year.year,
      startDate: year.startDate.split('T')[0],
      endDate: year.endDate.split('T')[0],
      status: year.status,
      isActive: year.isActive
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedYear.set(null);
  }

  saveYear(): void {
    this.loading.set(true);
    
    if (this.editMode() && this.selectedYear()) {
      this.schoolYearService.update(this.selectedYear()!.id, this.formData()).subscribe({
        next: () => {
          this.loadYears();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour année', err);
          this.loading.set(false);
        }
      });
    } else {
      this.schoolYearService.create(this.formData()).subscribe({
        next: () => {
          this.loadYears();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création année', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteYear(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette année scolaire ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.schoolYearService.delete(id).subscribe({
          next: () => this.loadYears(),
          error: (err) => {
            console.error('Erreur suppression année', err);
            const message = err?.error?.message || 'Erreur lors de la suppression de l\'année scolaire.';
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

  setActive(id: string): void {
    this.loading.set(true);
    this.schoolYearService.setActive(id).subscribe({
      next: () => this.loadYears(),
      error: (err) => {
        console.error('Erreur activation année', err);
        this.loading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getStatusBadgeClass(status: string): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    switch (statusObj?.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'gray':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

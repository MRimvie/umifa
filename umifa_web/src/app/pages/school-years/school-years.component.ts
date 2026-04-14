import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolYearService, SchoolYear, CreateSchoolYearDto, SchoolYearStatus } from '../../core/services/school-year.service';

@Component({
  selector: 'app-school-years',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
  formData = signal<CreateSchoolYearDto>({
    year: '',
    startDate: '',
    endDate: '',
    status: SchoolYearStatus.INSCRIPTION,
    isActive: false
  });

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
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement années', err);
        this.loading.set(false);
      }
    });
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette année scolaire ?')) {
      this.loading.set(true);
      this.schoolYearService.delete(id).subscribe({
        next: () => this.loadYears(),
        error: (err) => {
          console.error('Erreur suppression année', err);
          this.loading.set(false);
        }
      });
    }
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

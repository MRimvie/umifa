import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolService } from '../../core/services/school.service';
import { School } from '../../core/models/candidate.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';

interface SchoolFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  contactName: string;
}

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent],
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss']
})
export class SchoolsComponent implements OnInit {
  private schoolService = inject(SchoolService);
  
  schools = signal<School[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedSchool = signal<School | null>(null);

  nameFilter = signal('');
  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedSchool = signal<School | null>(null);

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  private dialogConfirmAction: (() => void) | null = null;
  
  formData = signal<SchoolFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactName: ''
  });

  openMobileDetails(school: School): void {
    this.mobileSelectedSchool.set(school);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

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

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.loading.set(true);
    this.schoolService.getAll().subscribe({
      next: (data) => {
        this.schools.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement écoles', err);
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

  get filteredSchools(): School[] {
    const q = this.nameFilter().trim().toLowerCase();
    if (!q) return this.schools();
    return this.schools().filter((s) => s.name.toLowerCase().includes(q));
  }

  get pagedSchools(): School[] {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredSchools.slice(start, start + this.pageSize());
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      name: '',
      address: '',
      phone: '',
      email: '',
      contactName: ''
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(school: School): void {
    this.editMode.set(true);
    this.selectedSchool.set(school);
    this.formData.set({
      name: school.name,
      address: school.address,
      phone: school.phone || '',
      email: school.email || '',
      contactName: school.contactName || ''
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedSchool.set(null);
  }

  saveSchool(): void {
    this.loading.set(true);
    
    if (this.editMode() && this.selectedSchool()) {
      this.schoolService.update(this.selectedSchool()!.id, this.formData()).subscribe({
        next: () => {
          this.loadSchools();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour école', err);
          this.loading.set(false);
        }
      });
    } else {
      this.schoolService.create(this.formData()).subscribe({
        next: () => {
          this.loadSchools();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création école', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteSchool(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette école ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.schoolService.delete(id).subscribe({
          next: () => this.loadSchools(),
          error: (err) => {
            console.error('Erreur suppression école', err);
            const message = err?.error?.message || 'Erreur lors de la suppression de l\'école.';
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

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamCenterService, ExamCenter, CreateExamCenterDto } from '../../core/services/exam-center.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-exam-centers',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent, TranslateModule],
  templateUrl: './exam-centers.component.html',
  styleUrls: ['./exam-centers.component.scss']
})
export class ExamCentersComponent implements OnInit {
  private examCenterService = inject(ExamCenterService);
  
  centers = signal<ExamCenter[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedCenter = signal<ExamCenter | null>(null);

  queryFilter = signal('');
  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedCenter = signal<ExamCenter | null>(null);

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
  
  formData = signal<CreateExamCenterDto>({
    name: '',
    nameAr: '',
    address: '',
    capacity: 0,
    phone: ''
  });

  openMobileDetails(center: ExamCenter): void {
    this.mobileSelectedCenter.set(center);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(): void {
    this.loading.set(true);
    this.examCenterService.getAll().subscribe({
      next: (data) => {
        this.centers.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement centres', err);
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

  get filteredCenters(): ExamCenter[] {
    const q = this.queryFilter().trim().toLowerCase();
    if (!q) return this.centers();
    return this.centers().filter((c) => {
      return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
    });
  }

  get pagedCenters(): ExamCenter[] {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredCenters.slice(start, start + this.pageSize());
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      name: '',
      nameAr: '',
      address: '',
      capacity: 0,
      phone: ''
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(center: ExamCenter): void {
    this.editMode.set(true);
    this.selectedCenter.set(center);
    this.formData.set({
      name: center.name,
      nameAr: center.nameAr || '',
      address: center.address,
      capacity: center.capacity,
      phone: center.phone || ''
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedCenter.set(null);
  }

  saveCenter(): void {
    this.loading.set(true);
    this.formData.set({ ...this.formData(), capacity: 0 });
    
    if (this.editMode() && this.selectedCenter()) {
      this.examCenterService.update(this.selectedCenter()!.id, this.formData()).subscribe({
        next: () => {
          this.loadCenters();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour centre', err);
          this.loading.set(false);
        }
      });
    } else {
      this.examCenterService.create(this.formData()).subscribe({
        next: () => {
          this.loadCenters();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création centre', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteCenter(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce centre d\'examen ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.examCenterService.delete(id).subscribe({
          next: () => this.loadCenters(),
          error: (err) => {
            console.error('Erreur suppression centre', err);
            const message = err?.error?.message || 'Erreur lors de la suppression du centre.';
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

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { SubjectService, Subject } from '../../core/services/subject.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnInit {
  private subjectService = inject(SubjectService);

  subjects = signal<Subject[]>([]);
  loading = signal(false);

  queryFilter = signal('');
  showDrawer = signal(false);
  editMode = signal(false);
  selectedSubject = signal<Subject | null>(null);

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedSubject = signal<Subject | null>(null);

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

  formData = signal<{ name: string; noteMax: number; isActive: boolean }>({
    name: '',
    noteMax: 20,
    isActive: true,
  });

  setActive(next: boolean): void {
    this.formData.set({ ...this.formData(), isActive: next });
  }

  setNoteMax(val: string | number): void {
    this.formData.set({ ...this.formData(), noteMax: Number(val) || 20 });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.subjectService.getAll({ includeInactive: true }).subscribe({
      next: (data) => {
        this.subjects.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement matières', err);
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

  onChangeFilters(): void {
    this.pageIndex.set(0);
  }

  get filteredSubjects(): Subject[] {
    const q = this.queryFilter().trim().toLowerCase();
    if (!q) return this.subjects();
    return this.subjects().filter((s) => s.name.toLowerCase().includes(q));
  }

  get pagedSubjects(): Subject[] {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredSubjects.slice(start, start + this.pageSize());
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.selectedSubject.set(null);
    this.formData.set({ name: '', noteMax: 20, isActive: true });
    this.showDrawer.set(true);
  }

  openEditDrawer(subject: Subject): void {
    this.editMode.set(true);
    this.selectedSubject.set(subject);
    this.formData.set({ name: subject.name, noteMax: subject.noteMax ?? 20, isActive: subject.isActive });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedSubject.set(null);
  }

  saveSubject(): void {
    const payload = this.formData();
    this.loading.set(true);

    if (this.editMode() && this.selectedSubject()) {
      this.subjectService.update(this.selectedSubject()!.id, payload).subscribe({
        next: () => {
          this.loadSubjects();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour matière', err);
          this.loading.set(false);
        },
      });
      return;
    }

    this.subjectService.create(payload).subscribe({
      next: () => {
        this.loadSubjects();
        this.closeDrawer();
      },
      error: (err) => {
        console.error('Erreur création matière', err);
        this.loading.set(false);
      },
    });
  }

  deleteSubject(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette matière ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.subjectService.delete(id).subscribe({
          next: () => this.loadSubjects(),
          error: (err) => {
            console.error('Erreur suppression matière', err);
            const message = err?.error?.message || 'Erreur lors de la suppression de la matière.';
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

  openMobileDetails(subject: Subject): void {
    this.mobileSelectedSubject.set(subject);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }
}

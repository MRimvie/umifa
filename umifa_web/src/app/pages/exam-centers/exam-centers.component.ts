import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamCenterService, ExamCenter, CreateExamCenterDto } from '../../core/services/exam-center.service';

@Component({
  selector: 'app-exam-centers',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
  formData = signal<CreateExamCenterDto>({
    name: '',
    address: '',
    capacity: 0,
    phone: ''
  });

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(): void {
    this.loading.set(true);
    this.examCenterService.getAll().subscribe({
      next: (data) => {
        this.centers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement centres', err);
        this.loading.set(false);
      }
    });
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      name: '',
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce centre d\'examen ?')) {
      this.loading.set(true);
      this.examCenterService.delete(id).subscribe({
        next: () => this.loadCenters(),
        error: (err) => {
          console.error('Erreur suppression centre', err);
          this.loading.set(false);
        }
      });
    }
  }
}

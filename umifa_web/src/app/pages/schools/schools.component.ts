import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolService } from '../../core/services/school.service';
import { School } from '../../core/models/candidate.model';

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
  imports: [CommonModule, FormsModule],
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
  
  formData = signal<SchoolFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactName: ''
  });

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.loading.set(true);
    this.schoolService.getAll().subscribe({
      next: (data) => {
        this.schools.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement écoles', err);
        this.loading.set(false);
      }
    });
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      this.loading.set(true);
      this.schoolService.delete(id).subscribe({
        next: () => this.loadSchools(),
        error: (err) => {
          console.error('Erreur suppression école', err);
          this.loading.set(false);
        }
      });
    }
  }
}

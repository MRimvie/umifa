import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolService } from '../../core/services/school.service';
import { School } from '../../core/models/candidate.model';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss']
})
export class SchoolsComponent implements OnInit {
  private schoolService = inject(SchoolService);
  schools = signal<School[]>([]);

  ngOnInit(): void {
    this.loadSchools();
  }

  private loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => this.schools.set(data),
      error: (err) => console.error('Erreur chargement écoles', err)
    });
  }
}

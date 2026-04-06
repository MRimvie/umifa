import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolService } from '../../core/services/school.service';
import { SchoolYear } from '../../core/models/candidate.model';

@Component({
  selector: 'app-school-years',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './school-years.component.html',
  styleUrls: ['./school-years.component.scss']
})
export class SchoolYearsComponent implements OnInit {
  private schoolService = inject(SchoolService);
  years = signal<SchoolYear[]>([]);

  ngOnInit(): void {
    this.loadYears();
  }

  private loadYears(): void {
    this.schoolService.getAllYears().subscribe({
      next: (data) => this.years.set(data),
      error: (err) => console.error('Erreur chargement années', err)
    });
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolService } from '../../core/services/school.service';
import { ExamCenter } from '../../core/models/candidate.model';

@Component({
  selector: 'app-exam-centers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-centers.component.html',
  styleUrls: ['./exam-centers.component.scss']
})
export class ExamCentersComponent implements OnInit {
  private schoolService = inject(SchoolService);
  centers = signal<ExamCenter[]>([]);

  ngOnInit(): void {
    this.loadCenters();
  }

  private loadCenters(): void {
    this.schoolService.getAllCenters().subscribe({
      next: (data) => this.centers.set(data),
      error: (err) => console.error('Erreur chargement centres', err)
    });
  }
}

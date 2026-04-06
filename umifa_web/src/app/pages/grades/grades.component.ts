import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeService } from '../../core/services/grade.service';
import { Grade } from '../../core/models/candidate.model';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})
export class GradesComponent implements OnInit {
  private gradeService = inject(GradeService);
  grades = signal<Grade[]>([]);

  ngOnInit(): void {
    this.loadGrades();
  }

  private loadGrades(): void {
    this.gradeService.getAll().subscribe({
      next: (data) => this.grades.set(data),
      error: (err) => console.error('Erreur chargement notes', err)
    });
  }
}

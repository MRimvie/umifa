import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolService } from '../../core/services/school.service';
import { Candidate, School, SchoolYear } from '../../core/models/candidate.model';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  private candidateService = inject(CandidateService);
  candidates = signal<Candidate[]>([]);

  ngOnInit(): void {
    this.loadCandidates();
  }

  private loadCandidates(): void {
    this.candidateService.getAll().subscribe({
      next: (data) => this.candidates.set(data),
      error: (err) => console.error('Erreur chargement candidats', err)
    });
  }
}

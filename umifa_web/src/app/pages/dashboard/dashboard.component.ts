import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolService } from '../../core/services/school.service';

interface DashboardStats {
  totalCandidates: number;
  totalSchools: number;
  totalCenters: number;
  activeYear: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private candidateService = inject(CandidateService);
  private schoolService = inject(SchoolService);
  private translate = inject(TranslateService);

  stats = signal<DashboardStats>({
    totalCandidates: 0,
    totalSchools: 0,
    totalCenters: 0,
    activeYear: ''
  });

  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Charge les données du dashboard
   */
  private loadDashboardData(): void {
    this.loading.set(true);

    // Charger les statistiques en parallèle
    Promise.all([
      this.candidateService.getAll().toPromise(),
      this.schoolService.getAll().toPromise(),
      this.schoolService.getAllCenters().toPromise(),
      this.schoolService.getActiveYear().toPromise()
    ]).then(([candidates, schools, centers, activeYear]) => {
      this.stats.set({
        totalCandidates: candidates?.length || 0,
        totalSchools: schools?.length || 0,
        totalCenters: centers?.length || 0,
        activeYear: activeYear?.year || 'N/A'
      });
      this.loading.set(false);
    }).catch(error => {
      console.error('Erreur lors du chargement des données', error);
      this.loading.set(false);
    });
  }

  /**
   * Retourne le message de bienvenue personnalisé
   */
  getWelcomeMessage(): string {
    const user = this.authService.currentUser();
    const hour = new Date().getHours();
    let key = 'dashboard.greetingMorning';
    if (hour >= 12 && hour < 18) key = 'dashboard.greetingAfternoon';
    else if (hour >= 18) key = 'dashboard.greetingEvening';
    return `${this.translate.instant(key)}, ${user?.firstName} ${user?.lastName}`;
  }

  getRoleLabel(): string {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    return this.translate.instant(`dashboard.roles.${role}`) || role;
  }
}

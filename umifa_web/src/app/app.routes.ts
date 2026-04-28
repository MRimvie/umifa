import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'candidates',
        loadComponent: () => import('./pages/candidates/candidates.component').then(m => m.CandidatesComponent)
      },
      {
        path: 'distribution',
        loadComponent: () => import('./pages/distribution/distribution.component').then(m => m.DistributionComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      },
      {
        path: 'grades',
        loadComponent: () => import('./pages/grades/grades.component').then(m => m.GradesComponent),
        canActivate: [roleGuard(['SUPER_ADMIN', 'GRADER'])]
      },
      {
        path: 'grades/candidate/:id',
        loadComponent: () => import('./pages/grades/grade-candidate-details.component').then(m => m.GradeCandidateDetailsComponent),
        canActivate: [roleGuard(['SUPER_ADMIN', 'GRADER'])]
      },
      {
        path: 'subjects',
        loadComponent: () => import('./pages/subjects/subjects.component').then(m => m.SubjectsComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      },
      {
        path: 'schools',
        loadComponent: () => import('./pages/schools/schools.component').then(m => m.SchoolsComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      },
      {
        path: 'exam-centers',
        loadComponent: () => import('./pages/exam-centers/exam-centers.component').then(m => m.ExamCentersComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      },
      {
        path: 'school-years',
        loadComponent: () => import('./pages/school-years/school-years.component').then(m => m.SchoolYearsComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [roleGuard(['SUPER_ADMIN'])]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  // Comptes de test pour faciliter la démo
  testAccounts = [
    { label: 'Super Admin', email: 'admin@gmail.com', password: 'admin123' },
    { label: 'Responsable École', email: 'manager@gmail.com', password: 'manager123' },
    { label: 'Correcteur', email: 'correcteur@gmail.com', password: 'correcteur123' }
  ];

  /**
   * Connexion de l'utilisateur
   */
  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Email ou mot de passe incorrect');
      }
    });
  }

  /**
   * Remplit le formulaire avec un compte de test
   */
  fillTestAccount(account: { email: string; password: string }): void {
    this.email.set(account.email);
    this.password.set(account.password);
  }

  /**
   * Bascule l'affichage du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}

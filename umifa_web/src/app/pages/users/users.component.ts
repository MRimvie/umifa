import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUserDto, UserRole } from '../../core/services/user.service';
import { SchoolService } from '../../core/services/school.service';
import { ExamCenterService } from '../../core/services/exam-center.service';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileListComponent, BottomSheetComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private schoolService = inject(SchoolService);
  private examCenterService = inject(ExamCenterService);

  users = signal<User[]>([]);
  schools = signal<any[]>([]);
  centers = signal<any[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedUser = signal<User | null>(null);

  mobileSheetOpen = signal(false);
  mobileSelectedUser = signal<User | null>(null);

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  private dialogConfirmAction: (() => void) | null = null;

  private openDialog(params: {
    title: string;
    message: string;
    variant: 'info' | 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  }): void {
    this.dialogTitle.set(params.title);
    this.dialogMessage.set(params.message);
    this.dialogVariant.set(params.variant);
    this.dialogConfirmAction = params.onConfirm ?? null;
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.dialogConfirmAction = null;
  }

  confirmDialog(): void {
    const action = this.dialogConfirmAction;
    this.closeDialog();
    action?.();
  }

  formData = signal<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.SCHOOL_MANAGER
  });

  userRoles = [
    { value: UserRole.SUPER_ADMIN, label: 'Super Administrateur' },
    { value: UserRole.SCHOOL_MANAGER, label: 'Responsable d\'école' },
    { value: UserRole.GRADER, label: 'Correcteur' }
  ];

  openMobileDetails(user: User): void {
    this.mobileSelectedUser.set(user);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadSchools();
    this.loadCenters();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.loading.set(false);
      }
    });
  }

  loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => this.schools.set(data),
      error: (err) => console.error('Erreur chargement écoles', err)
    });
  }

  loadCenters(): void {
    this.examCenterService.getAll().subscribe({
      next: (data) => this.centers.set(data),
      error: (err) => console.error('Erreur chargement centres', err)
    });
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: UserRole.SCHOOL_MANAGER
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(user: User): void {
    this.editMode.set(true);
    this.selectedUser.set(user);
    this.formData.set({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      schoolId: user.schoolId,
      centerId: user.centerId
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedUser.set(null);
  }

  saveUser(): void {
    this.loading.set(true);

    if (this.editMode() && this.selectedUser()) {
      const { password, ...updateData } = this.formData();
      this.userService.update(this.selectedUser()!.id, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour utilisateur', err);
          this.loading.set(false);
        }
      });
    } else {
      this.userService.create(this.formData()).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création utilisateur', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteUser(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.userService.delete(id).subscribe({
          next: () => this.loadUsers(),
          error: (err) => {
            console.error('Erreur suppression utilisateur', err);
            const message = err?.error?.message || 'Erreur lors de la suppression de l\'utilisateur.';
            this.openDialog({
              title: 'Suppression impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }

  getRoleLabel(role: string): string {
    const roleObj = this.userRoles.find(r => r.value === role);
    return roleObj?.label || role;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.SCHOOL_MANAGER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.GRADER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

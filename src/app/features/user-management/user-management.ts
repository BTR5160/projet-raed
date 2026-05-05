import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss' // Changed to scss
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  // State Signals
  isLoading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  
  // Modal Mode
  modalMode = signal<'ADD' | 'EDIT'>('ADD');
  selectedUserId = signal<string | null>(null);

  // Form
  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    confirmPassword: ['']
  });

  // Computed for stats
  agentsCount = computed(() => this.adminService.agents().filter(u => u.role === 'AGENT').length);
  adminsCount = computed(() => this.adminService.agents().filter(u => u.role === 'ADMIN').length);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.adminService.getAgents().subscribe(() => {
      this.isLoading.set(false);
    });
  }

  get users() {
    return this.adminService.agents;
  }

  openAddModal() {
    this.modalMode.set('ADD');
    this.selectedUserId.set(null);
    this.userForm.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.modalMode.set('EDIT');
    this.selectedUserId.set(user.id);
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    const userData = this.userForm.value;

    if (this.modalMode() === 'ADD') {
      this.adminService.addAgent(userData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
        }
      });
    } else if (this.selectedUserId()) {
      this.adminService.updateAgent(this.selectedUserId()!, userData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
        }
      });
    }
  }

  toggleStatus(user: User) {
    this.adminService.toggleAgentStatus(user.id).subscribe();
  }

  getInitials(user: User): string {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
}
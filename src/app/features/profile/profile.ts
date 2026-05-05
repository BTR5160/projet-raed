import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  user = this.authService.currentUser;
  profileForm: FormGroup;
  isSaving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);

  constructor() {
    const currentUser = this.user();
    this.profileForm = this.fb.group({
      firstName: [currentUser?.firstName || '', Validators.required],
      lastName: [currentUser?.lastName || '', Validators.required],
      email: [{ value: currentUser?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['+216 71 000 000'],
      agence: ['Siège Social - Tunis']
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    // Simulation
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }, 1500);
  }
}

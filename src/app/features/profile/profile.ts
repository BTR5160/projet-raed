import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { delay, of } from 'rxjs';
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
  isSaving = signal(false);
  success = signal('');

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  get passwordMismatch() {
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  updatePassword() {
    if (this.passwordForm.invalid || this.passwordMismatch) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    of(true).pipe(delay(1500)).subscribe(() => {
      this.isSaving.set(false);
      this.success.set('Mot de passe mis à jour avec succès.');
      this.passwordForm.reset();
    });
  }
}

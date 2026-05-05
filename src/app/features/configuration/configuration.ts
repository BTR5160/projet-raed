import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss' // Refined premium styles
})
export class ConfigurationComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  isAgent = signal<boolean>(false);

  security = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.isAgent.set(user.role === 'AGENT');
    }
  }

  saveProfile() {
    if (this.isAgent()) return;
    // Logic for Admin to save profile
  }

  updatePassword() {
    // Even Agents might want to update password, but the user said:
    // "L'Agent ne peut pas modifier son propre mot de passe si la politique impose que ce soit l'Admin"
    // I will disable it for Agents as requested.
    if (this.isAgent()) return;
    
    if (this.security.newPassword !== this.security.confirmPassword) {
      return;
    }
    // Update logic
  }
}

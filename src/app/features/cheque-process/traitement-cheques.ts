import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ChequeService } from '../../core/services/cheque.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cheque } from '../../core/models/cheque.model';
import { ComponentCanDeactivate } from '../../core/guards/pending-changes.guard';

@Component({ selector: 'app-traitement-cheques', standalone: true, imports: [CommonModule, ReactiveFormsModule], templateUrl: './traitement-cheques.html', styleUrl: './traitement-cheques.scss' })
export class TraitementChequesComponent implements OnInit, ComponentCanDeactivate {
  private chequeService = inject(ChequeService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cheque = signal<Cheque | null>(null);
  treatmentForm!: FormGroup;
  isSubmitting = this.chequeService.isSavingDecision;
  isLoading = signal<boolean>(false);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.key === 'Enter') { event.preventDefault(); this.onSubmit(); }
    if (event.key === 'Escape') { event.preventDefault(); this.onReject(); }
  }
  canDeactivate(): boolean | Observable<boolean> { return !(this.treatmentForm?.dirty && !this.isSubmitting()); }

  ngOnInit() { this.loadCurrentCheque(); }

  private loadCurrentCheque() {
    const current = this.chequeService.currentScannedCheque();
    if (!current) return void this.router.navigate(['/scanner']);
    this.isLoading.set(true);
    setTimeout(() => { this.cheque.set(current); this.initForm(current); this.isLoading.set(false); }, 1200);
  }

  private initForm(cheque: Cheque) {
    this.treatmentForm = this.fb.group({
      chequeNumber: [cheque.chequeNumber.value, Validators.required], amountNumeric: [cheque.amountNumeric.value, [Validators.required, Validators.min(0)]],
      amountText: [cheque.amountText.value, Validators.required], emitterName: [cheque.emitterName.value, Validators.required], beneficiaryName: [cheque.beneficiaryName.value, Validators.required],
      date: [cheque.date.value, Validators.required], bank: [cheque.bank.value, Validators.required], rib: [cheque.rib.value, Validators.required], signatureValid: [cheque.signatureValid.value, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.treatmentForm.invalid || !this.cheque() || this.isSubmitting()) return;
    this.chequeService.completeCheque('VALIDATED', this.treatmentForm.getRawValue()).subscribe(() => {
      this.notificationService.show('Chèque validé et ajouté à l’historique', 'success');
      this.chequeService.clearCurrentFlow();
      this.router.navigate(['/scanner']);
    });
  }

  onReject() {
    if (!this.cheque() || this.isSubmitting()) return;
    this.chequeService.completeCheque('REJECTED').subscribe(() => {
      this.notificationService.show('Chèque rejeté et ajouté à l’historique', 'warning');
      this.chequeService.clearCurrentFlow();
      this.router.navigate(['/scanner']);
    });
  }
}

import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChequeService } from '../../core/services/cheque.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cheque, ChequeStatus } from '../../core/models/cheque.model';
import { ComponentCanDeactivate } from '../../core/guards/pending-changes.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-traitement-cheques',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traitement-cheques.html',
  styleUrl: './traitement-cheques.scss'
})
export class TraitementChequesComponent implements OnInit, ComponentCanDeactivate {
  private chequeService = inject(ChequeService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  cheque = signal<Cheque | null>(null);
  treatmentForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  isManualMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  
  // Scan Progress UI
  currentStep = signal<number>(1);
  scanSteps = [
    { id: 1, label: 'Réception de l\'image', status: 'done' },
    { id: 2, label: 'Identification des caractères (OCR)', status: 'active' },
    { id: 3, label: 'Vérification de la conformité bancaire', status: 'pending' },
    { id: 4, label: 'Analyse de la signature', status: 'pending' }
  ];

  // UI Panels
  isHistoryOpen = signal<boolean>(false);
  recentHistory = signal<Cheque[]>([]);

  // Image manipulation
  imageRotation = signal<number>(0);
  imageZoom = signal<number>(1);
  imageContrast = signal<number>(100);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    const isInput = (event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA';
    
    if (isInput) return;

    if (event.key === 'h' || event.key === 'H') {
      this.toggleHistory();
    }
    
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onReject();
    }
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.treatmentForm && this.treatmentForm.dirty && !this.isSubmitting()) {
      return confirm('Modifications non enregistrées. Voulez-vous vraiment quitter le tunnel de production ?');
    }
    return true;
  }

  ngOnInit() {
    this.loadCurrentCheque();
    this.loadHistory();
  }

  private loadCurrentCheque() {
    const current = this.chequeService.currentCheque();
    if (!current) {
      this.router.navigate(['/scanner']);
      return;
    }
    
    this.isLoading.set(true);
    this.currentStep.set(2); // Start at OCR

    // Step 2 -> 3
    setTimeout(() => this.currentStep.set(3), 1000);
    // Step 3 -> 4
    setTimeout(() => this.currentStep.set(4), 2000);

    // Finalize
    setTimeout(() => {
      this.cheque.set(current);
      this.initForm(current);
      this.isLoading.set(false);
    }, 3200);
  }

  private loadHistory() {
    this.chequeService.getHistory().subscribe(history => {
      this.recentHistory.set(history.slice(0, 5));
    });
  }

  private initForm(cheque: Cheque) {
    this.treatmentForm = this.fb.group({
      chequeNumber: [cheque.chequeNumber.value, Validators.required],
      amountNumeric: [cheque.amountNumeric.value, [Validators.required, Validators.min(0)]],
      amountText: [cheque.amountText.value, Validators.required],
      emitterName: [cheque.emitterName.value, Validators.required],
      beneficiaryName: [cheque.beneficiaryName.value, Validators.required],
      date: [cheque.date.value, Validators.required],
      bank: [cheque.bank.value, Validators.required],
      rib: [cheque.rib.value, Validators.required],
      signatureValid: [cheque.signatureValid.value, Validators.requiredTrue]
    });
  }

  toggleHistory() {
    this.isHistoryOpen.update(v => !v);
  }

  // Image Tools
  rotateImage() { this.imageRotation.update(r => (r + 90) % 360); }
  zoomIn() { this.imageZoom.update(z => Math.min(z + 0.2, 3)); }
  zoomOut() { this.imageZoom.update(z => Math.max(z - 0.2, 0.5)); }
  toggleContrast() { this.imageContrast.update(c => c === 100 ? 150 : 100); }

  enableManualMode() {
    this.isManualMode.set(true);
    this.notificationService.show('Saisie manuelle activée.', 'warning');
  }

  onSubmit() {
    if (this.treatmentForm.invalid || !this.cheque()) return;

    this.isSubmitting.set(true);
    this.chequeService.validateCheque(this.cheque()!.id, this.treatmentForm.value).subscribe({
      next: () => {
        this.notificationService.show('Chèque validé avec succès', 'success');
        this.loadHistory(); // Refresh mini-history
        this.loadNextCheque();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  onReject() {
    if (!this.cheque()) return;
    if (confirm('Confirmer le rejet de ce chèque ?')) {
      this.isSubmitting.set(true);
      this.chequeService.rejectCheque(this.cheque()!.id).subscribe({
        next: () => {
          this.notificationService.show('Chèque rejeté', 'warning');
          this.loadHistory();
          this.loadNextCheque();
        }
      });
    }
  }

  private loadNextCheque() {
    this.isSubmitting.set(false);
    this.chequeService.getPendingCheques().subscribe(pending => {
      if (pending.length > 0) {
        this.chequeService.currentCheque.set(pending[0]);
        this.loadCurrentCheque();
        this.imageRotation.set(0);
        this.imageZoom.set(1);
      } else {
        this.chequeService.currentCheque.set(null);
        this.router.navigate(['/scanner']);
      }
    });
  }
}
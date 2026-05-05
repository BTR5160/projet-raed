import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChequeService } from '../../../core/services/cheque.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss'
})
export class ScannerComponent {
  private chequeService = inject(ChequeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentStep = signal<'idle' | 'scanning' | 'analyzing' | 'completed'>('idle');
  scanProgress = signal<number>(0);
  isDragging = signal<boolean>(false);

  processedCheque = this.chequeService.currentScannedCheque;
  processedTodayCount = this.chequeService.processedTodayCount;
  lastProcessedCheque = this.chequeService.lastProcessedCheque;

  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging.set(true); }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging.set(false); }
  onDrop(event: DragEvent) { event.preventDefault(); this.isDragging.set(false); const file = event.dataTransfer?.files?.[0]; if (file) this.handleFile(file); }
  onFileSelected(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (file) this.handleFile(file); }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      this.notificationService.show('Format non supporté. Utilisez JPG, PNG ou PDF.', 'error');
      return;
    }
    this.chequeService.clearCurrentFlow();
    this.startScanProcess(file);
  }

  private startScanProcess(file: File) {
    this.currentStep.set('scanning');
    this.scanProgress.set(0);
    const interval = setInterval(() => {
      this.scanProgress.update(v => v + 20);
      if (this.scanProgress() >= 100) {
        clearInterval(interval);
        this.currentStep.set('analyzing');
        this.chequeService.processChequeImage(file).subscribe({
          next: (cheque) => {
            this.chequeService.setCurrentCheque(cheque);
            this.currentStep.set('completed');
          },
          error: () => this.reset()
        });
      }
    }, 150);
  }

  validateCheque() { this.router.navigate(['/traitement-cheques']); }
  reset() { this.chequeService.clearCurrentFlow(); this.currentStep.set('idle'); this.scanProgress.set(0); }
}

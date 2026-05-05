import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChequeService } from '../../../core/services/cheque.service';
import { Cheque } from '../../../core/models/cheque.model';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss' // Changed to scss
})
export class ScannerComponent {
  private chequeService = inject(ChequeService);
  private router = inject(Router);

  // States
  currentStep = signal<'idle' | 'scanning' | 'analyzing' | 'completed'>('idle');
  scanProgress = signal<number>(0);
  
  // Data
  processedCheque = signal<Cheque | null>(null);

  // Drag & Drop State
  isDragging = signal<boolean>(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    // Basic validation
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Format non supporté. Veuillez utiliser JPG, PNG ou PDF.');
      return;
    }

    this.startScanProcess(file);
  }

  // Fallback for manual button click
  startScan() {
    // Create a mock file
    const mockFile = new File([''], 'mock-scan.jpg', { type: 'image/jpeg' });
    this.startScanProcess(mockFile);
  }

  private startScanProcess(file: File) {
    this.currentStep.set('scanning');
    this.scanProgress.set(0);

    // Simulate scanning progress bar
    const interval = setInterval(() => {
      this.scanProgress.update(v => v + 10);
      if (this.scanProgress() >= 100) {
        clearInterval(interval);
        this.analyzeCheque(file);
      }
    }, 150);
  }

  private analyzeCheque(file: File) {
    this.currentStep.set('analyzing');
    
    // Call the mock service
    this.chequeService.processChequeImage(file).subscribe({
      next: (cheque) => {
        this.processedCheque.set(cheque);
        this.chequeService.currentCheque.set(cheque);
        this.currentStep.set('completed');
      },
      error: (err) => {
        console.error('Erreur lors du traitement', err);
        this.reset();
      }
    });
  }

  validateCheque() {
    // Redirect to treatment interface
    this.router.navigate(['/traitement-cheques']);
  }

  reset() {
    this.currentStep.set('idle');
    this.scanProgress.set(0);
    this.processedCheque.set(null);
  }
}


import { Injectable, computed, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Cheque, ChequeStatus } from '../models/cheque.model';

@Injectable({ providedIn: 'root' })
export class ChequeService {
  readonly currentScannedCheque = signal<Cheque | null>(null);
  readonly currentOcrResult = signal<Cheque | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly isSavingDecision = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly history = signal<Cheque[]>(this.generateMockHistory());
  readonly processedTodayCount = computed(() => this.history().filter(c => new Date(c.uploadDate).toDateString() === new Date().toDateString()).length);
  readonly lastProcessedCheque = computed(() => this.history()[0] ?? null);

  processChequeImage(file: File): Observable<Cheque> {
    this.isProcessing.set(true);
    this.error.set(null);
    this.currentOcrResult.set(null);

    const lowConfidence = Math.random() > 0.65;
    const mockProcessedCheque: Cheque = {
      id: `CHQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      imagePath: URL.createObjectURL(file),
      uploadDate: new Date().toISOString(),
      status: 'PENDING',
      chequeNumber: { value: `${Math.floor(1000000 + Math.random() * 8999999)}`, confidence: 0.98 },
      amountNumeric: { value: Number((400 + Math.random() * 7000).toFixed(3)), confidence: 0.93 },
      amountText: { value: 'Montant détecté automatiquement', confidence: lowConfidence ? 0.74 : 0.91 },
      emitterName: { value: lowConfidence ? 'SOCIETE ?' : 'SOCIETE ALPHA TUNISIE', confidence: lowConfidence ? 0.59 : 0.94 },
      beneficiaryName: { value: 'RAED ABID', confidence: 0.88 },
      date: { value: new Date().toISOString().slice(0, 10), confidence: 0.97 },
      bank: { value: 'BIAT', confidence: 0.99 },
      rib: { value: '08 123 4567890123456 78', confidence: 0.96 },
      signatureValid: { value: true, confidence: lowConfidence ? 0.67 : 0.9 },
      overallConfidence: lowConfidence ? 0.73 : 0.92
    };

    return of(mockProcessedCheque).pipe(delay(1700));
  }

  setCurrentCheque(cheque: Cheque): void {
    this.currentScannedCheque.set(cheque);
    this.currentOcrResult.set(cheque);
    this.isProcessing.set(false);
  }

  completeCheque(status: Exclude<ChequeStatus, 'PENDING'>, updatedData?: Partial<Cheque>): Observable<Cheque> {
    const cheque = this.currentScannedCheque();
    if (!cheque) {
      this.error.set('Aucun chèque en cours de traitement.');
      return of(null as never).pipe(delay(1000));
    }

    if (this.isSavingDecision()) {
      return of(cheque).pipe(delay(1000));
    }

    this.isSavingDecision.set(true);
    const processed: Cheque = { ...cheque, ...updatedData, status, uploadDate: new Date().toISOString() };

    this.history.update(current => {
      const existingIndex = current.findIndex(item => item.id === processed.id);
      if (existingIndex >= 0) {
        const copy = [...current];
        copy[existingIndex] = processed;
        return copy;
      }
      return [processed, ...current];
    });

    return of(processed).pipe(delay(1200));
  }

  clearCurrentFlow(): void {
    this.currentScannedCheque.set(null);
    this.currentOcrResult.set(null);
    this.isProcessing.set(false);
    this.isSavingDecision.set(false);
    this.error.set(null);
  }

  getHistory(): Observable<Cheque[]> {
    return of(this.history()).pipe(delay(1100));
  }

  private generateMockHistory(): Cheque[] { return [
      { id: 'CHQ-1A2B3C4', imagePath: 'assets/mock-cheque-1.jpg', uploadDate: new Date(Date.now() - 86400000).toISOString(), status: 'VALIDATED', chequeNumber: { value: '1234567', confidence: 0.99 }, amountNumeric: { value: 500, confidence: 0.98 }, amountText: { value: 'Cinq cents dinars', confidence: 0.95 }, emitterName: { value: 'AHMED ABID', confidence: 0.99 }, beneficiaryName: { value: 'STE TECH', confidence: 0.98 }, date: { value: '2026-05-03', confidence: 0.99 }, bank: { value: 'ATB', confidence: 0.99 }, rib: { value: '01 001 1234567890123 45', confidence: 0.98 }, signatureValid: { value: true, confidence: 0.99 }, overallConfidence: 0.98 },
      { id: 'CHQ-X9Y8Z7', imagePath: 'assets/mock-cheque-2.jpg', uploadDate: new Date(Date.now() - 172800000).toISOString(), status: 'REJECTED', chequeNumber: { value: '7654321', confidence: 0.99 }, amountNumeric: { value: 10000, confidence: 0.85 }, amountText: { value: 'Dix mille dinars', confidence: 0.6 }, emitterName: { value: 'INCONNU', confidence: 0.4 }, beneficiaryName: { value: 'MOHAMED SALAH', confidence: 0.9 }, date: { value: '2026-05-01', confidence: 0.99 }, bank: { value: 'BNA', confidence: 0.99 }, rib: { value: '03 003 9876543210987 65', confidence: 0.95 }, signatureValid: { value: false, confidence: 0.8 }, overallConfidence: 0.65 }
    ]; }
}

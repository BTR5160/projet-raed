import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Cheque, ChequeStatus } from '../models/cheque.model';

@Injectable({
  providedIn: 'root'
})
export class ChequeService {
  
  // State for currently processing cheque
  currentCheque = signal<Cheque | null>(null);
  
  // State for history
  chequesHistory = signal<Cheque[]>(this.generateMockHistory());

  getPendingCheques(): Observable<Cheque[]> {
    const pending: Cheque[] = [
      {
        id: 'CHQ-QUE-001',
        imagePath: 'assets/mock-cheque-pending-1.jpg',
        uploadDate: new Date().toISOString(),
        status: 'PENDING',
        chequeNumber: { value: '8887776', confidence: 0.99 },
        amountNumeric: { value: 3450.000, confidence: 0.95 },
        amountText: { value: 'Trois mille quatre cent cinquante dinars', confidence: 0.92 },
        emitterName: { value: 'SOCIETE BETA', confidence: 0.96 },
        beneficiaryName: { value: 'ALIA KHIR', confidence: 0.88 },
        date: { value: '2026-05-04', confidence: 0.99 },
        bank: { value: 'UIB', confidence: 0.99 },
        rib: { value: '12 345 6789012345678 90', confidence: 0.97 },
        signatureValid: { value: true, confidence: 0.94 },
        overallConfidence: 0.95
      }
    ];
    return of(pending).pipe(delay(500));
  }

  // Simulates uploading and analyzing an image
  processChequeImage(file: File): Observable<Cheque> {
    const mockProcessedCheque: Cheque = {
      id: 'CHQ-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      imagePath: URL.createObjectURL(file), // Local preview
      uploadDate: new Date().toISOString(),
      status: 'PENDING',
      
      // Simulating OCR results with varying confidence
      chequeNumber: { value: '9876543', confidence: 0.99 },
      amountNumeric: { value: 1250.500, confidence: 0.95 },
      amountText: { value: 'Mille deux cent cinquante dinars et cinq cents millimes', confidence: 0.88 },
      emitterName: { value: 'SOCIETE ALPHA TUNISIE', confidence: 0.92 },
      beneficiaryName: { value: 'RAED ABID', confidence: 0.75 }, // Low confidence example
      date: { value: '2026-05-04', confidence: 0.98 },
      bank: { value: 'BIAT', confidence: 0.99 },
      rib: { value: '08 123 4567890123456 78', confidence: 0.96 },
      signatureValid: { value: true, confidence: 0.82 },
      
      overallConfidence: 0.90
    };

    return of(mockProcessedCheque).pipe(
      delay(2500) // Simulate heavy AI processing
    );
  }

  validateCheque(chequeId: string, updatedData: Partial<Cheque>): Observable<boolean> {
    // Update local history mock
    this.chequesHistory.update(history => 
      history.map(c => c.id === chequeId ? { ...c, ...updatedData, status: 'VALIDATED' as ChequeStatus } : c)
    );
    
    return of(true).pipe(delay(1000));
  }

  rejectCheque(chequeId: string): Observable<boolean> {
    this.chequesHistory.update(history => 
      history.map(c => c.id === chequeId ? { ...c, status: 'REJECTED' as ChequeStatus } : c)
    );
    
    return of(true).pipe(delay(1000));
  }

  getHistory(): Observable<Cheque[]> {
    return of(this.chequesHistory()).pipe(delay(800));
  }

  private generateMockHistory(): Cheque[] {
    return [
      {
        id: 'CHQ-1A2B3C4',
        imagePath: 'assets/mock-cheque-1.jpg',
        uploadDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'VALIDATED',
        chequeNumber: { value: '1234567', confidence: 0.99 },
        amountNumeric: { value: 500.000, confidence: 0.98 },
        amountText: { value: 'Cinq cents dinars', confidence: 0.95 },
        emitterName: { value: 'AHMED ABID', confidence: 0.99 },
        beneficiaryName: { value: 'STE TECH', confidence: 0.98 },
        date: { value: '2026-05-03', confidence: 0.99 },
        bank: { value: 'ATB', confidence: 0.99 },
        rib: { value: '01 001 1234567890123 45', confidence: 0.98 },
        signatureValid: { value: true, confidence: 0.99 },
        overallConfidence: 0.98
      },
      {
        id: 'CHQ-X9Y8Z7',
        imagePath: 'assets/mock-cheque-2.jpg',
        uploadDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'REJECTED',
        chequeNumber: { value: '7654321', confidence: 0.99 },
        amountNumeric: { value: 10000.000, confidence: 0.85 },
        amountText: { value: 'Dix mille dinars', confidence: 0.60 }, // Signature mismatch
        emitterName: { value: 'INCONNU', confidence: 0.40 },
        beneficiaryName: { value: 'MOHAMED SALAH', confidence: 0.90 },
        date: { value: '2026-05-01', confidence: 0.99 },
        bank: { value: 'BNA', confidence: 0.99 },
        rib: { value: '03 003 9876543210987 65', confidence: 0.95 },
        signatureValid: { value: false, confidence: 0.80 },
        overallConfidence: 0.65
      }
    ];
  }
}

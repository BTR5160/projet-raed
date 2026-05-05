export type ChequeStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface OCRField<T> {
  value: T;
  confidence: number;
  isManuallyVerified?: boolean;
}

export interface Cheque {
  id: string;
  imagePath: string;
  uploadDate: string;
  status: ChequeStatus;
  
  // OCR Extracted Fields
  chequeNumber: OCRField<string>;
  amountNumeric: OCRField<number>;
  amountText: OCRField<string>;
  emitterName: OCRField<string>;
  beneficiaryName: OCRField<string>;
  date: OCRField<string>;
  bank: OCRField<string>;
  rib: OCRField<string>;
  signatureValid: OCRField<boolean>;
  
  // Overall confidence
  overallConfidence: number;
}

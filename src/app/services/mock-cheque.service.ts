import { Injectable, signal } from '@angular/core';import { of } from 'rxjs';import { delay } from 'rxjs/operators';import { Cheque, ChequeOcrResult } from '../models/models';
@Injectable({providedIn:'root'})
export class MockChequeService{history=signal<Cheque[]>([]);current=signal<Cheque|null>(null);
  upload(file:File){const cheque:Cheque={id:'CHQ-'+Date.now(),imageUrl:URL.createObjectURL(file),date:new Date().toISOString().slice(0,10),emetteur:'',montant:0,statut:'En attente',scoreIa:0,agent:'Agent Demo'};this.current.set(cheque);return of(cheque).pipe(delay(1000));}
  processOCR(){const c=this.current()!;const ocr:ChequeOcrResult={montant:1540,emetteur:'SARL Atlas',date:new Date().toISOString().slice(0,10),signatureValid:true,confidence:[{field:'montant',score:.92},{field:'emetteur',score:.61},{field:'date',score:.78},{field:'signatureValid',score:.43}]};c.ocr=ocr;c.scoreIa=Math.round(ocr.confidence.reduce((a,b)=>a+b.score,0)/ocr.confidence.length*100);this.current.set({...c});return of(ocr).pipe(delay(1800));}
  finalize(statut:'Valide'|'Rejete',patch:Partial<ChequeOcrResult>){const c=this.current()!;c.statut=statut;c.emetteur=patch.emetteur??c.ocr!.emetteur;c.montant=patch.montant??c.ocr!.montant;c.date=patch.date??c.ocr!.date;this.history.set([c,...this.history()]);return of(c).pipe(delay(1000));}
  getHistory(){return of(this.history()).pipe(delay(1200));}
}

export type Role='AGENT'|'ADMIN';
export interface User{ id:string; name:string; email:string; role:Role; status:'actif'|'bloque';}
export interface ConfidenceScore{field:string;score:number}
export interface ChequeOcrResult{montant:number;emetteur:string;date:string;signatureValid:boolean;confidence:ConfidenceScore[]}
export interface Cheque{ id:string; imageUrl:string; date:string; emetteur:string; montant:number; statut:'Valide'|'Rejete'|'En attente'; scoreIa:number; agent:string; ocr?:ChequeOcrResult}
export interface Agent{ id:string; nom:string; email:string; role:'AGENT'; statut:'actif'|'bloque'; derniereActivite:string; nbCheques:number}
export interface DashboardKpis{traites:number;erreurIa:number;agentsActifs:number;enAttente:number;tauxValidation:number}

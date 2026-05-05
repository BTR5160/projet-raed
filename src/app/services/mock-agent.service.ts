import { Injectable, signal } from '@angular/core';import { Agent } from '../models/models';import { of } from 'rxjs';import { delay } from 'rxjs/operators';
@Injectable({providedIn:'root'}) export class MockAgentService{agents=signal<Agent[]>([{id:'1',nom:'Nadia Ben',email:'nadia@bank.tn',role:'AGENT',statut:'actif',derniereActivite:'2026-05-04',nbCheques:15}]);
list(){return of(this.agents()).pipe(delay(1100));}
add(a:Omit<Agent,'id'|'role'|'derniereActivite'|'nbCheques'>){const n:{id:string;nom:string;email:string;role:'AGENT';statut:'actif'|'bloque';derniereActivite:string;nbCheques:number}={id:crypto.randomUUID(),nom:a.nom,email:a.email,statut:a.statut,role:'AGENT',derniereActivite:new Date().toISOString().slice(0,10),nbCheques:0};this.agents.set([n,...this.agents()]);return of(n).pipe(delay(1000));}
update(agent:Agent){this.agents.set(this.agents().map(a=>a.id===agent.id?agent:a));return of(agent).pipe(delay(1000));}
}

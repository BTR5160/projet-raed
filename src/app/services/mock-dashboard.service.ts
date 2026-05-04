import { Injectable } from '@angular/core';import { of } from 'rxjs';import { delay } from 'rxjs/operators';
@Injectable({providedIn:'root'}) export class MockDashboardService{getKpis(){return of({traites:84,erreurIa:8,agentsActifs:6,enAttente:12,tauxValidation:89}).pipe(delay(1500));}}

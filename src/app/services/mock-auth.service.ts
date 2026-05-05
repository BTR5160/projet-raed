import { Injectable, computed, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Role, User } from '../models/models';
@Injectable({providedIn:'root'})
export class MockAuthService{
  readonly token=signal<string|null>(null); readonly user=signal<User|null>(null); readonly isAuthenticated=computed(()=>!!this.token());
  login(email:string,password:string){ if(password.length<6)return throwError(()=>new Error('Mot de passe invalide')).pipe(delay(1200));
    const role:Role|undefined=email==='agent@example.com'?'AGENT':email==='admin@example.com'?'ADMIN':undefined;
    if(!role)return throwError(()=>new Error('Identifiants invalides')).pipe(delay(1200));
    const user:User={id:crypto.randomUUID(),name:role==='AGENT'?'Agent Demo':'Admin Demo',email,role,status:'actif'};
    return of({token:'fake-jwt-token',user}).pipe(delay(1300)); }
  setSession(token:string,user:User){this.token.set(token);this.user.set(user)}
  logout(){this.token.set(null);this.user.set(null)}
  updatePassword(){return of(true).pipe(delay(1000));}
}

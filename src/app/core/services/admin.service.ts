import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { AgentActivity, ChartDataPoint, KPIStats, RecentActivity } from '../models/admin.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  // State for Agents list
  agents = signal<User[]>([
    { id: '1', email: 'ahmed.admin@biat.com.tn', firstName: 'Ahmed', lastName: 'Abid', role: 'ADMIN', isActive: true },
    { id: '2', email: 'raed.agent@biat.com.tn', firstName: 'Raed', lastName: 'Amri', role: 'AGENT', isActive: true },
    { id: '3', email: 'mohamed.agent@biat.com.tn', firstName: 'Mohamed', lastName: 'Rayen', role: 'AGENT', isActive: false },
    { id: '4', email: 'wajih.agent@biat.com.tn', firstName: 'Wajih', lastName: 'Yahyaoui', role: 'AGENT', isActive: true }
  ]);

  constructor() {}

  // Dashboard Stats
  getDashboardKPIs(): Observable<KPIStats> {
    const mockStats: KPIStats = {
      totalProcessedToday: 124,
      totalPending: 18,
      aiErrorRate: 4.5,
      activeAgents: 3,
      totalFraudDetected: 2
    };
    return of(mockStats).pipe(delay(1200));
  }

  getWeeklyProcessingData(): Observable<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [
      { day: 'Lun', value: 85 },
      { day: 'Mar', value: 110 },
      { day: 'Mer', value: 90 },
      { day: 'Jeu', value: 135 },
      { day: 'Ven', value: 124 },
      { day: 'Sam', value: 40 },
      { day: 'Dim', value: 20 }
    ];
    return of(data).pipe(delay(1000));
  }

  getAgentActivities(): Observable<AgentActivity[]> {
    const activities: AgentActivity[] = [
      { agentId: '2', agentName: 'Raed Amri', chequesProcessed: 45, averageTimePerCheque: 12 },
      { agentId: '4', agentName: 'Wajih Yahyaoui', chequesProcessed: 38, averageTimePerCheque: 15 },
      { agentId: '3', agentName: 'Mohamed Rayen', chequesProcessed: 0, averageTimePerCheque: 0 } // Inactive
    ];
    return of(activities).pipe(delay(1500));
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    const activities: RecentActivity[] = [
      { id: '1', agentName: 'Raed Amri', chequeNumber: '84721', status: 'VALIDATED', time: '5m' },
      { id: '2', agentName: 'Wajih Yahyaoui', chequeNumber: '84722', status: 'VALIDATED', time: '12m' },
      { id: '3', agentName: 'Ahmed Abid', chequeNumber: '84723', status: 'REJECTED', time: '25m' }
    ];
    return of(activities).pipe(delay(1300));
  }

  // User Management
  getAgents(): Observable<User[]> {
    return of(this.agents()).pipe(delay(1000));
  }

  addAgent(agent: Partial<User>): Observable<User> {
    const newAgent: User = {
      id: Math.random().toString(36).substring(2, 9),
      email: agent.email!,
      firstName: agent.firstName!,
      lastName: agent.lastName!,
      role: 'AGENT',
      isActive: true,
      avatar: 'assets/avatars/default.png'
    };
    
    this.agents.update(list => [...list, newAgent]);
    return of(newAgent).pipe(delay(1500));
  }

  updateAgent(id: string, updates: Partial<User>): Observable<boolean> {
    this.agents.update(list => 
      list.map(agent => agent.id === id ? { ...agent, ...updates } : agent)
    );
    return of(true).pipe(delay(1200));
  }

  toggleAgentStatus(id: string): Observable<boolean> {
    this.agents.update(list => 
      list.map(agent => agent.id === id ? { ...agent, isActive: !agent.isActive } : agent)
    );
    return of(true).pipe(delay(800));
  }
}

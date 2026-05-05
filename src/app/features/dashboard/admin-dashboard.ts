import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ChartDataPoint, KPIStats, RecentActivity } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  dateJour = signal<string>('');
  
  // State Signals
  isLoading = signal<boolean>(true);
  stats = signal<KPIStats | null>(null);
  weeklyData = signal<ChartDataPoint[]>([]);
  recentActivities = signal<RecentActivity[]>([]);

  ngOnInit() {
    this.setDate();
    this.loadDashboardData();
  }

  private setDate() {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.dateJour.set(new Date().toLocaleDateString('fr-FR', options));
  }

  loadDashboardData() {
    this.isLoading.set(true);
    
    this.adminService.getDashboardKPIs().subscribe(data => {
      this.stats.set(data);
      this.checkLoadingComplete();
    });

    this.adminService.getWeeklyProcessingData().subscribe(data => {
      this.weeklyData.set(data);
      this.checkLoadingComplete();
    });

    this.adminService.getRecentActivities().subscribe(data => {
      this.recentActivities.set(data);
      this.checkLoadingComplete();
    });
  }

  private checkLoadingComplete() {
    if (this.stats() && this.weeklyData().length > 0 && this.recentActivities().length > 0) {
      this.isLoading.set(false);
    }
  }

  getBarHeight(value: number, max: number = 150): string {
    return `${(value / max) * 100}%`;
  }
}
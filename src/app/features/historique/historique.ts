import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChequeService } from '../../core/services/cheque.service';
import { Cheque } from '../../core/models/cheque.model';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.html', 
  styleUrl: './historique.scss' // Changed to scss
})
export class HistoriqueComponent implements OnInit {
  private chequeService = inject(ChequeService);

  // State Signals
  isLoading = signal<boolean>(true);
  chequesList = signal<Cheque[]>([]);
  
  // Filter Signals
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  // Computed signal for filtered results
  filteredCheques = computed(() => {
    const list = this.chequesList();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return list.filter(cheque => {
      const matchesSearch = !search || 
        cheque.id.toLowerCase().includes(search) ||
        cheque.emitterName.value.toLowerCase().includes(search) ||
        cheque.chequeNumber.value.includes(search);
      
      const matchesStatus = status === 'ALL' || cheque.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.chequeService.getHistory().subscribe({
      next: (data) => {
        this.chequesList.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.statusFilter.set(target.value);
  }
}
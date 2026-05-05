import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChequeService } from '../../core/services/cheque.service';
import { Cheque, ChequeStatus } from '../../core/models/cheque.model';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.html',
  styleUrl: './historique.scss'
})
export class HistoriqueComponent implements OnInit {
  private chequeService = inject(ChequeService);

  isLoading = signal(true);
  chequesList = signal<Cheque[]>([]);
  searchTerm = signal('');
  statusFilter = signal<'ALL' | ChequeStatus>('ALL');
  dateFilter = signal('');
  currentPage = signal(1);
  pageSize = 5;

  filteredCheques = computed(() => {
    const list = this.chequesList();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    const date = this.dateFilter();

    return list.filter((cheque) => {
      const matchesSearch = !search
        || cheque.id.toLowerCase().includes(search)
        || cheque.emitterName.value.toLowerCase().includes(search);
      const matchesStatus = status === 'ALL' || cheque.status === status;
      const matchesDate = !date || cheque.date.value === date;
      return matchesSearch && matchesStatus && matchesDate;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCheques().length / this.pageSize)));
  paginatedCheques = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCheques().slice(start, start + this.pageSize);
  });

  ngOnInit() { this.loadHistory(); }

  loadHistory() {
    this.isLoading.set(true);
    this.chequeService.getHistory().subscribe({
      next: (data) => {
        this.chequesList.set(data);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange(event: Event) { this.searchTerm.set((event.target as HTMLInputElement).value); this.currentPage.set(1); }
  onStatusFilterChange(event: Event) { this.statusFilter.set((event.target as HTMLSelectElement).value as 'ALL' | ChequeStatus); this.currentPage.set(1); }
  onDateFilterChange(event: Event) { this.dateFilter.set((event.target as HTMLInputElement).value); this.currentPage.set(1); }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(v => v - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(v => v + 1); }
}

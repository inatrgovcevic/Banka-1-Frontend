import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ClientDto,
  ClientFilters,
  ClientPageResponse,
  ClientService
} from '../../services/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {
  public clients: ClientDto[] = [];
  public filters: Required<ClientFilters> = {
    firstName: '',
    lastName: '',
    email: ''
  };
  public isLoading = false;
  public errorMessage = '';
  public currentPage = 0;
  public readonly pageSize = 10;
  public totalElements = 0;
  public totalPages = 0;

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly clientService: ClientService) {}

  public ngOnInit(): void {
    this.loadClients();
  }

  public ngOnDestroy(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
  }

  public onFiltersChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadClients();
    }, 300);
  }

  public clearFilters(): void {
    this.filters = {
      firstName: '',
      lastName: '',
      email: ''
    };
    this.currentPage = 0;
    this.loadClients();
  }

  public goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadClients();
  }

  public trackByClientId(index: number, client: ClientDto): string | number {
    return client.id ?? index;
  }

  public getFullName(client: ClientDto): string {
    const firstName = client.ime ?? client.firstName ?? '';
    const lastName = client.prezime ?? client.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || client.name || '-';
  }

  public getPhoneNumber(client: ClientDto): string {
    return client.brojTelefona?.trim() || client.phoneNumber?.trim() || '-';
  }

  public getDetailsLink(client: ClientDto): (string | number)[] {
    return ['/employees/clients', client.id];
  }

  public getLastItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  private loadClients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.clientService.getClients(this.filters, this.currentPage, this.pageSize).subscribe({
      next: (response: ClientPageResponse) => {
        this.clients = this.sortClients(response.content);
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          error.error?.error ||
          'Došlo je do greške pri učitavanju klijenata.';
        this.clients = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private sortClients(clients: ClientDto[]): ClientDto[] {
    return [...clients].sort((first: ClientDto, second: ClientDto) => {
      const lastNameComparison = this.getSortableLastName(first).localeCompare(
        this.getSortableLastName(second),
        'sr',
        { sensitivity: 'base' }
      );

      if (lastNameComparison !== 0) {
        return lastNameComparison;
      }

      return this.getFullName(first).localeCompare(this.getFullName(second), 'sr', {
        sensitivity: 'base'
      });
    });
  }

  private getSortableLastName(client: ClientDto): string {
    return (client.prezime ?? client.lastName ?? '').trim();
  }
}

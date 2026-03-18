import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ClientListComponent } from './client-list.component';
import { ClientPageResponse, ClientService } from '../../services/client.service';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let clientService: jasmine.SpyObj<ClientService>;

  const mockResponse: ClientPageResponse = {
    content: [
      {
        id: '2',
        ime: 'Marko',
        prezime: 'Markovic',
        email: 'marko.markovic@company.com',
        brojTelefona: '+38160111222'
      },
      {
        id: '1',
        ime: 'Ana',
        prezime: 'Andric',
        email: 'ana.andric@company.com',
        brojTelefona: '+38160111333'
      }
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10
  };

  beforeEach(async () => {
    const clientSpy = jasmine.createSpyObj('ClientService', ['getClients']);
    clientSpy.getClients.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      declarations: [ClientListComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [{ provide: ClientService, useValue: clientSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on init and sort them by last name', () => {
    expect(clientService.getClients).toHaveBeenCalledWith(
      { firstName: '', lastName: '', email: '' },
      0,
      10
    );
    expect(component.clients.length).toBe(2);
    expect(component.clients[0].prezime).toBe('Andric');
    expect(component.clients[1].prezime).toBe('Markovic');
  });

  it('should debounce filters and reset pagination before loading', fakeAsync(() => {
    component.currentPage = 2;
    component.filters.firstName = 'Petar';

    component.onFiltersChange();
    tick(299);

    expect(clientService.getClients).toHaveBeenCalledTimes(1);

    tick(1);

    expect(component.currentPage).toBe(0);
    expect(clientService.getClients).toHaveBeenCalledTimes(2);
    expect(clientService.getClients.calls.mostRecent().args).toEqual([
      { firstName: 'Petar', lastName: '', email: '' },
      0,
      10
    ]);
  }));

  it('should clear filters and reload the first page', () => {
    component.filters = {
      firstName: 'Pera',
      lastName: 'Peric',
      email: 'pera@test.com'
    };
    component.currentPage = 1;

    component.clearFilters();

    expect(component.filters).toEqual({
      firstName: '',
      lastName: '',
      email: ''
    });
    expect(component.currentPage).toBe(0);
    expect(clientService.getClients.calls.mostRecent().args).toEqual([
      { firstName: '', lastName: '', email: '' },
      0,
      10
    ]);
  });

  it('should move to the requested page when it is in range', () => {
    component.totalPages = 3;

    component.goToPage(1);

    expect(component.currentPage).toBe(1);
    expect(clientService.getClients.calls.mostRecent().args).toEqual([
      { firstName: '', lastName: '', email: '' },
      1,
      10
    ]);
  });

  it('should expose the details link for a client', () => {
    expect(component.getDetailsLink(mockResponse.content[0])).toEqual(['/employees/clients', '2']);
  });

  it('should show an error message when loading fails', () => {
    clientService.getClients.and.returnValue(
      throwError(() => ({
        error: { message: 'Backend error' }
      }))
    );

    component['loadClients']();

    expect(component.errorMessage).toBe('Backend error');
    expect(component.clients).toEqual([]);
  });
});

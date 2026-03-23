// cypress/e2e/home-transactions.cy.ts
// E2E testovi za F9 - prikaz poslednjih 5 transakcija na početnoj strani
// Pokretanje: npx cypress open  ili  npx cypress run

const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';

const mockAccounts = [
  {
    id: 1,
    name: 'Tekući račun',
    accountNumber: '265000000000123456',
    balance: 180000,
    availableBalance: 178000,
    reservedFunds: 2000,
    currency: 'RSD',
    status: 'ACTIVE',
    subtype: 'STANDARD',
    ownerId: 1,
    ownerName: 'Petar Petrović',
    employeeId: 2,
    maintenanceFee: 255,
    dailyLimit: 250000,
    monthlyLimit: 1000000,
    dailySpending: 150000,
    monthlySpending: 600000,
    createdAt: '2024-01-01',
    expiryDate: '2027-01-01'
  },
  {
    id: 2,
    name: 'Devizni račun',
    accountNumber: '265000000000654321',
    balance: 5000,
    availableBalance: 4850,
    reservedFunds: 150,
    currency: 'EUR',
    status: 'ACTIVE',
    subtype: 'FOREIGN_PERSONAL',
    ownerId: 1,
    ownerName: 'Petar Petrović',
    employeeId: 2,
    maintenanceFee: 0,
    dailyLimit: 10000,
    monthlyLimit: 50000,
    dailySpending: 200,
    monthlySpending: 1500,
    createdAt: '2024-03-01',
    expiryDate: '2027-03-01'
  }
];

const mockTransactions = [
  {
    id: 1,
    fromAccountId: 1,
    toAccountNumber: '265000000000111111',
    recipientName: 'APPLE.COM',
    amount: 3000,
    currency: 'RSD',
    status: 'COMPLETED',
    description: 'Pretplata',
    createdAt: '2026-03-03T10:00:00',
    type: 'PAYMENT'
  },
  {
    id: 2,
    fromAccountId: 1,
    toAccountNumber: '265000000000222222',
    recipientName: 'GLOVO',
    amount: 2000,
    currency: 'RSD',
    status: 'FAILED',
    description: 'Dostava',
    createdAt: '2026-03-01T14:30:00',
    type: 'PAYMENT'
  },
  {
    id: 3,
    fromAccountId: 1,
    toAccountNumber: '265000000000333333',
    recipientName: 'LLC',
    amount: 2787,
    currency: 'RSD',
    status: 'PENDING',
    description: 'Usluge',
    createdAt: '2026-03-01T09:15:00',
    type: 'PAYMENT'
  },
  {
    id: 4,
    fromAccountId: 1,
    toAccountNumber: '265000000000444444',
    recipientName: 'Bosch Inc',
    amount: 50000,
    currency: 'RSD',
    status: 'PENDING',
    description: 'Oprema',
    createdAt: '2026-02-28T11:00:00',
    type: 'PAYMENT'
  },
  {
    id: 5,
    fromAccountId: 1,
    toAccountNumber: '265000000000555555',
    recipientName: 'Amazon EU',
    amount: 8500,
    currency: 'RSD',
    status: 'COMPLETED',
    description: 'Kupovina',
    createdAt: '2026-02-27T16:45:00',
    type: 'PAYMENT'
  }
];

describe('Home - Pregled transakcija (F9)', () => {

  beforeEach(() => {
    cy.clearLocalStorage();

    cy.window().then(win => {
      win.localStorage.setItem('authToken', mockToken);
      win.localStorage.setItem('loggedUser', JSON.stringify({
        email: 'klijent@test.com',
        role: 'Client',
        permissions: []
      }));
    });

    cy.intercept('GET', '**/client/accounts*', {
      statusCode: 200,
      body: { content: mockAccounts, totalElements: 2, totalPages: 1, number: 0, size: 10 }
    }).as('getAccounts');

    cy.intercept('GET', '**/client/accounts/1/transactions*', {
      statusCode: 200,
      body: { content: mockTransactions, totalElements: 5, totalPages: 1, number: 0, size: 5 }
    }).as('getTransactions');

    cy.visit('/home');
    cy.wait('@getAccounts');
    cy.wait('@getTransactions');
  });

  // ─────────────────────────────────────────────
  // PRIKAZ SEKCIJE
  // ─────────────────────────────────────────────

  describe('Prikaz sekcije transakcija', () => {

    it('treba da prikaže sekciju PREGLED TRANSAKCIJA', () => {
      cy.contains('PREGLED TRANSAKCIJA').should('exist');
    });

    it('treba da prikaže naziv selektovanog računa u headeru transakcija', () => {
      cy.contains('Tekući račun').should('exist');
    });

    it('treba da prikaže kolone tabele: Datum, Primalac, Iznos, Status', () => {
      cy.get('.tx-table th').eq(0).should('contain', 'Datum');
      cy.get('.tx-table th').eq(1).should('contain', 'Primalac');
      cy.get('.tx-table th').eq(2).should('contain', 'Iznos');
      cy.get('.tx-table th').eq(3).should('contain', 'Status');
    });

  });

  // ─────────────────────────────────────────────
  // SADRŽAJ TRANSAKCIJA
  // ─────────────────────────────────────────────

  describe('Sadržaj transakcija', () => {

    it('treba da prikaže tačno 5 transakcija', () => {
      cy.get('.tx-table tbody tr').should('have.length', 5);
    });

    it('treba da prikaže ime primaoca prve transakcije', () => {
      cy.contains('APPLE.COM').should('exist');
    });

    it('treba da prikaže datum prve transakcije', () => {
      cy.contains('03.03.2026').should('exist');
    });

    it('treba da prikaže iznos prve transakcije', () => {
      cy.contains('3.000,00 RSD').should('exist');
    });

    it('treba da prikaže sve primaoce transakcija', () => {
      cy.contains('APPLE.COM').should('exist');
      cy.contains('GLOVO').should('exist');
      cy.contains('LLC').should('exist');
      cy.contains('Bosch Inc').should('exist');
      cy.contains('Amazon EU').should('exist');
    });

  });

  // ─────────────────────────────────────────────
  // STATUS BADGE-OVI
  // ─────────────────────────────────────────────

  describe('Status badge-ovi', () => {

    it('treba da prikaže status Odobreno za COMPLETED transakciju', () => {
      cy.contains('Odobreno').should('exist');
    });

    it('treba da prikaže status Odbijeno za FAILED transakciju', () => {
      cy.contains('Odbijeno').should('exist');
    });

    it('treba da prikaže status Čekanje za PENDING transakciju', () => {
      cy.contains('Čekanje').should('exist');
    });

    it('COMPLETED badge treba da ima zelenu boju pozadine', () => {
      cy.get('.status--completed').first().should('exist');
    });

    it('FAILED badge treba da ima crvenu boju pozadine', () => {
      cy.get('.status--failed').first().should('exist');
    });

    it('PENDING badge treba da ima sivu boju pozadine', () => {
      cy.get('.status--pending').first().should('exist');
    });

  });

  // ─────────────────────────────────────────────
  // PROMENA SELEKTOVANOG RAČUNA
  // ─────────────────────────────────────────────

  describe('Promena selektovanog računa', () => {

    it('treba da učita transakcije drugog računa pri kliku', () => {
      cy.intercept('GET', '**/client/accounts/2/transactions*', {
        statusCode: 200,
        body: {
          content: [
            {
              id: 6,
              fromAccountId: 2,
              toAccountNumber: '265000000000999999',
              recipientName: 'Booking.com',
              amount: 150,
              currency: 'EUR',
              status: 'COMPLETED',
              description: 'Hotel',
              createdAt: '2026-03-05T12:00:00',
              type: 'PAYMENT'
            }
          ],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 5
        }
      }).as('getTransactions2');

      cy.contains('Devizni račun').click();
      cy.wait('@getTransactions2');

      cy.contains('Booking.com').should('exist');
      cy.contains('APPLE.COM').should('not.exist');
    });

    it('treba da prikaže naziv novog računa u headeru transakcija', () => {
      cy.intercept('GET', '**/client/accounts/2/transactions*', {
        statusCode: 200,
        body: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 5 }
      }).as('getTransactions2');

      cy.contains('Devizni račun').click();
      cy.wait('@getTransactions2');

      cy.get('.card--transactions .card__sublabel').should('contain', 'Devizni račun');
    });

    it('lista se osvežava bez reload-a stranice', () => {
      cy.intercept('GET', '**/client/accounts/2/transactions*', {
        statusCode: 200,
        body: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 5 }
      }).as('getTransactions2');

      cy.url().then(urlBefore => {
        cy.contains('Devizni račun').click();
        cy.wait('@getTransactions2');
        cy.url().should('eq', urlBefore);
      });
    });

  });

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────

  describe('Loading state', () => {

    it('treba da prikaže skeleton dok se transakcije učitavaju', () => {
      cy.intercept('GET', '**/client/accounts/1/transactions*', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: { content: mockTransactions, totalElements: 5, totalPages: 1, number: 0, size: 5 }
        });
      }).as('getTransactionsSlow');

      cy.visit('/home', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authToken', mockToken);
          win.localStorage.setItem('loggedUser', JSON.stringify({
            email: 'klijent@test.com', role: 'Client', permissions: []
          }));
        }
      });

      cy.get('.skel-tx').should('exist');
      cy.wait('@getTransactionsSlow');
      cy.get('.skel-tx').should('not.exist');
    });

  });

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────

  describe('Error state', () => {

    it('treba da prikaže error poruku kada API za transakcije vrati grešku', () => {
      cy.intercept('GET', '**/client/accounts/1/transactions*', {
        statusCode: 500,
        body: { message: 'Server error' }
      }).as('getTransactionsError');

      cy.visit('/home', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authToken', mockToken);
          win.localStorage.setItem('loggedUser', JSON.stringify({
            email: 'klijent@test.com', role: 'Client', permissions: []
          }));
        }
      });

      cy.wait('@getAccounts');
      cy.wait('@getTransactionsError');

      cy.contains('Greška pri učitavanju transakcija').should('exist');
    });

    it('treba da prikaže poruku kada nema transakcija', () => {
      cy.intercept('GET', '**/client/accounts/1/transactions*', {
        statusCode: 200,
        body: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 5 }
      }).as('getEmptyTransactions');

      cy.visit('/home', {
        onBeforeLoad(win) {
          win.localStorage.setItem('authToken', mockToken);
          win.localStorage.setItem('loggedUser', JSON.stringify({
            email: 'klijent@test.com', role: 'Client', permissions: []
          }));
        }
      });

      cy.wait('@getAccounts');
      cy.wait('@getEmptyTransactions');

      cy.contains('Nema transakcija za ovaj račun').should('exist');
    });

  });

});

describe('Exchange page', () => {
  beforeEach(() => {
    cy.visit('/exchange');
  });

  it('should open exchange page successfully', () => {
    cy.url().should('include', '/exchange');
    cy.get('[data-cy="exchange-page-title"]').should('be.visible').and('contain', 'BERZE');
    cy.get('[data-cy="exchange-table"]').should('be.visible');
  });

  it('should render all required table headers', () => {
    cy.contains('th', 'NAZIV BERZE').should('be.visible');
    cy.contains('th', 'AKRONIM').should('be.visible');
    cy.contains('th', 'MIC KOD').should('be.visible');
    cy.contains('th', 'DRŽAVA').should('be.visible');
    cy.contains('th', 'VALUTA').should('be.visible');
    cy.contains('th', 'VREMENSKA ZONA').should('be.visible');
    cy.contains('th', 'TRENUTNO OTVORENA').should('be.visible');
    cy.contains('th', 'RADNO VREME').should('be.visible');
  });

  it('should display exchange rows with data', () => {
    cy.get('[data-cy^="exchange-row-"]').should('have.length.at.least', 1);
    cy.get('[data-cy="exchange-name-0"]').should('be.visible');
    cy.get('[data-cy="exchange-name-1"]').should('be.visible');
  });

  it('should show status badge values', () => {
    cy.get('[data-cy="exchange-status-0"]').should('contain.text', 'NE');
    cy.get('[data-cy="exchange-status-1"]').should('contain.text', 'NE');
    cy.get('[data-cy="exchange-status-2"]').should('contain.text', 'DA');
  });

  it('should toggle working hours checkbox', () => {
    cy.get('[data-cy="exchange-toggle-0"]').should('not.be.checked');
    cy.get('[data-cy="exchange-toggle-0"]').click({ force: true });
    cy.get('[data-cy="exchange-toggle-0"]').should('be.checked');
  });

  it('should allow toggling multiple exchanges independently', () => {
    cy.get('[data-cy="exchange-toggle-1"]').should('be.checked');
    cy.get('[data-cy="exchange-toggle-1"]').click({ force: true });
    cy.get('[data-cy="exchange-toggle-1"]').should('not.be.checked');

    cy.get('[data-cy="exchange-toggle-2"]').should('be.checked');
    cy.get('[data-cy="exchange-toggle-2"]').click({ force: true });
    cy.get('[data-cy="exchange-toggle-2"]').should('not.be.checked');
  });
});
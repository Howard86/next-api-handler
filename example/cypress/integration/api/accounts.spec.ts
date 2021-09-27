describe('Accounts', () => {
  it('should get accounts correctly', () => {
    cy.request('/api/accounts').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal('ACCOUNTS');
    });
  });
});

export {};

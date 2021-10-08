describe('Users', () => {
  it('should get users correctly', () => {
    cy.request('/api/users').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal('USERS');
    });
  });
});

export {};

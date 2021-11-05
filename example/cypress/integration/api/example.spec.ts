describe('Example API', () => {
  it('should get the same response before & after', () => {
    const STATUS = 200;
    const RESPONSE = {
      success: true,
      data: 'John Doe',
    };

    cy.request('/api/before/example').then((response) => {
      expect(response.status).to.equal(STATUS);
      expect(response.body).to.deep.equal(RESPONSE);
    });

    cy.request('/api/after/example').then((response) => {
      expect(response.status).to.equal(STATUS);
      expect(response.body).to.deep.equal(RESPONSE);
    });
  });
});

export {};

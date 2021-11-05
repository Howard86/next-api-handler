describe('Simple API', () => {
  it('should get the same error response before & after', () => {
    const ERROR_STATUS = 400;
    const BAD_REQUEST_RESPONSE = {
      success: false,
      message: 'Id is required',
    };

    cy.request({ url: '/api/before/simple', failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.equal(ERROR_STATUS);
        expect(response.body).to.deep.equal(BAD_REQUEST_RESPONSE);
      }
    );

    cy.request({ url: '/api/after/simple', failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.equal(ERROR_STATUS);
        expect(response.body).to.deep.equal(BAD_REQUEST_RESPONSE);
      }
    );
  });

  it('should get the same success response before & after', () => {
    const REQUEST_ID_QUERY = '12345';

    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: `Data with id=${REQUEST_ID_QUERY}`,
    };

    cy.request(`/api/before/simple?id=${REQUEST_ID_QUERY}`).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request(`/api/after/simple?id=${REQUEST_ID_QUERY}`).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });
});

export {};

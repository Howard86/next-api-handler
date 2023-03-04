describe('Middleware API', () => {
  it('should get the same unauthorized error response before & after', () => {
    const ERROR_STATUS = 401;
    const UNAUTHORIZED_RESPONSE = {
      success: false,
      message: 'Unauthorized',
    };

    cy.setCookie('TEST_COOKIE', 'INVALID_COOKIE');
    cy.request({
      url: `/api/before/middleware`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(ERROR_STATUS);
      expect(response.body).to.deep.equal(UNAUTHORIZED_RESPONSE);
    });

    cy.request({
      url: `/api/after/middleware`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(ERROR_STATUS);
      expect(response.body).to.deep.equal(UNAUTHORIZED_RESPONSE);
    });
  });

  it('should get the same GET response before & after', () => {
    const METHOD = 'GET';
    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: {
        id: 'TEST_ID',
        name: 'Name with email=EMAIL',
        email: 'EMAIL',
      },
    };

    cy.setCookie('TEST_COOKIE', 'VALID_COOKIE');
    cy.request({
      url: `/api/before/middleware`,
      method: METHOD,
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request({
      url: `/api/after/middleware`,
      method: METHOD,
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });

  it('should get the same PUT response before & after', () => {
    const METHOD = 'PUT';
    const BODY = {
      name: 'New name',
    };
    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: {
        id: 'TEST_ID',
        name: BODY.name,
        email: 'EMAIL',
      },
    };

    cy.setCookie('TEST_COOKIE', 'VALID_COOKIE');
    cy.request({
      url: `/api/before/middleware`,
      method: METHOD,
      body: BODY,
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request({
      url: `/api/after/middleware`,
      method: METHOD,
      body: BODY,
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });
});

export {};

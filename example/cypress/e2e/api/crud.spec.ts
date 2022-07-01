describe('CRUD API', () => {
  it('should get the same error response before & after', () => {
    const REQUEST_PARAM = '01234';
    const ERROR_STATUS = 405;
    const METHOD = 'POST';
    const BAD_REQUEST_RESPONSE = {
      success: false,
      message: `Method ${METHOD} Not Allowed`,
    };

    cy.request({
      url: `/api/before/crud/${REQUEST_PARAM}`,
      failOnStatusCode: false,
      method: METHOD,
    }).then((response) => {
      expect(response.headers.allow).to.equal('GET, PUT');
      expect(response.status).to.equal(ERROR_STATUS);
      expect(response.body).to.deep.equal(BAD_REQUEST_RESPONSE);
    });

    cy.request({
      url: `/api/after/crud/${REQUEST_PARAM}`,
      failOnStatusCode: false,
      method: METHOD,
    }).then((response) => {
      expect(response.headers.allow).to.equal('GET, PUT');
      expect(response.status).to.equal(ERROR_STATUS);
      expect(response.body).to.deep.equal(BAD_REQUEST_RESPONSE);
    });
  });

  it('should get the same GET response before & after', () => {
    const REQUEST_PARAM = '12345';

    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: {
        id: REQUEST_PARAM,
        name: `User ${REQUEST_PARAM}`,
      },
    };

    cy.request({
      url: `/api/before/crud/${REQUEST_PARAM}`,
      method: 'GET',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request({
      url: `/api/after/crud/${REQUEST_PARAM}`,
      method: 'GET',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });

  it('should get the same PUT response without query before & after', () => {
    const REQUEST_PARAM = '23456';

    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: {
        id: REQUEST_PARAM,
        name: `User ${REQUEST_PARAM}`,
      },
    };

    cy.request({
      url: `/api/before/crud/${REQUEST_PARAM}`,
      method: 'PUT',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request({
      url: `/api/after/crud/${REQUEST_PARAM}`,
      method: 'PUT',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });

  it('should get the same PUT response with query before & after', () => {
    const REQUEST_PARAM = '34567';
    const REQUEST_NAME_QUERY = 'howard86';

    const SUCCESS_STATUS = 200;
    const SUCCESS_RESPONSE = {
      success: true,
      data: {
        id: REQUEST_PARAM,
        name: REQUEST_NAME_QUERY,
      },
    };

    cy.request({
      url: `/api/before/crud/${REQUEST_PARAM}?name=${REQUEST_NAME_QUERY}`,
      method: 'PUT',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });

    cy.request({
      url: `/api/after/crud/${REQUEST_PARAM}?name=${REQUEST_NAME_QUERY}`,
      method: 'PUT',
    }).then((response) => {
      expect(response.status).to.equal(SUCCESS_STATUS);
      expect(response.body).to.deep.equal(SUCCESS_RESPONSE);
    });
  });
});

export {};

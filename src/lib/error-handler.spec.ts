import test from 'ava';
import type { NextApiRequest, NextApiResponse } from 'next';
import sinon, { SinonSpy } from 'sinon';

import { makeErrorHandler } from './error-handler';
import { HttpException } from './http-exceptions';
import { ErrorApiResponse } from './type';

const req = {} as unknown as NextApiRequest;
const res = {
  status(_statusCode: number) {
    return this;
  },
  json(_data: unknown) {
    return;
  },
} as unknown as NextApiResponse;

let spiedJson: SinonSpy<[data: unknown], void>;
let spiedStatus: SinonSpy<[statusCode: number], NextApiResponse>;

test.beforeEach(() => {
  spiedJson = sinon.spy(res, 'json');
  spiedStatus = sinon.spy(res, 'status');
});

test.afterEach(() => {
  spiedJson.restore();
  spiedStatus.restore();
});

test.serial(
  'should accept non-http-exception error and return error message when showError is true',
  (t) => {
    const errorHandler = makeErrorHandler(true);
    errorHandler(req, res, new Error('TEST_ERROR'));

    t.true(spiedStatus.calledWith(500));
    t.true(
      spiedJson.calledWith({
        success: false,
        message: 'TEST_ERROR',
      } as ErrorApiResponse)
    );
  }
);

test.serial(
  'should accept non-http-exception error and return default error message when showError is false',
  (t) => {
    const errorHandler = makeErrorHandler(false);
    errorHandler(req, res, new Error('TEST_ERROR'));

    t.true(spiedStatus.calledWith(500));
    t.true(
      spiedJson.calledWith({
        success: false,
        message: 'Internal Server Error',
      } as ErrorApiResponse)
    );
  }
);

test.serial(
  'should accept http-exception error and return http error message when showError is true',
  (t) => {
    const errorHandler = makeErrorHandler(true);
    errorHandler(
      req,
      res,
      new HttpException(499, 'TEST_HTTP_ERROR', 'TEST_DEFAULT_HTTP_ERROR')
    );

    t.true(spiedStatus.calledWith(499));
    t.true(
      spiedJson.calledWith({
        success: false,
        message: 'TEST_HTTP_ERROR',
      } as ErrorApiResponse)
    );
  }
);

test.serial(
  'should accept http-exception error and return default http error message when showError is false',
  (t) => {
    const errorHandler = makeErrorHandler(false);
    errorHandler(
      req,
      res,
      new HttpException(499, 'TEST_HTTP_ERROR', 'TEST_DEFAULT_HTTP_ERROR')
    );

    t.true(spiedStatus.calledWith(499));
    t.true(
      spiedJson.calledWith({
        success: false,
        message: 'TEST_DEFAULT_HTTP_ERROR',
      } as ErrorApiResponse)
    );
  }
);

test.serial(
  'should accept exception error and return internal server error',
  (t) => {
    const errorHandler = makeErrorHandler(false);
    errorHandler(req, res, new HttpException(499, 'TEST_HTTP_ERROR'));

    t.true(spiedStatus.calledWith(499));
    t.true(
      spiedJson.calledWith({
        success: false,
        message: 'Internal Server Error',
      } as ErrorApiResponse)
    );
  }
);

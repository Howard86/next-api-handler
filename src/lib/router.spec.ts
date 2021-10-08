import test from 'ava';
import type { NextApiRequest, NextApiResponse } from 'next';
import sinon from 'sinon';

import { ErrorApiResponse, RouterBuilder, SuccessApiResponse } from './router';

const ROUTING_METHODS: (keyof RouterBuilder)[] = [
  'get',
  'head',
  'patch',
  'options',
  'connect',
  'delete',
  'trace',
  'post',
  'put',
];
const res = {
  status(_statusCode: number) {
    return this;
  },
  json(_data: unknown) {
    return;
  },
} as unknown as NextApiResponse;

const spiedJson = sinon.spy(res, 'json');
const spiedStatus = sinon.spy(res, 'status');

let router: RouterBuilder;

test.beforeEach(() => {
  router = new RouterBuilder();
});

test.afterEach(() => {
  spiedJson.restore();
});

test('should return 405 for all empty routes', async (t) => {
  const handler = router.build();

  await Promise.all(
    ROUTING_METHODS.map((method) => method.toUpperCase()).map(
      async (method) => {
        await handler({ method } as NextApiRequest, res);
        t.true(spiedStatus.calledWith(405));
        t.true(
          spiedJson.calledWith({
            success: false,
            message: `Method ${method} Not Allowed`,
          } as ErrorApiResponse)
        );
      }
    )
  );
});

test('should return value controlled by predefined handler', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const TEXT = `${method.toUpperCase()}_API_RESPONSE`;
      // const router = new RouterBuilder();
      router[method]((_req) => TEXT);
      const handler = router.build();
      await handler({ method: method.toUpperCase() } as NextApiRequest, res);
      t.true(spiedStatus.calledWith(200));
      t.true(
        spiedJson.calledWith({
          success: true,
          data: TEXT,
        } as SuccessApiResponse<string>)
      );
    })
  );
});

test('should handle errors', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const error = new Error(`${method.toUpperCase()}_API_ERROR`);
      // const router = new RouterBuilder();
      router[method]((_req) => {
        throw error;
      });
      const handler = router.build();
      await handler({ method: method.toUpperCase() } as NextApiRequest, res);
      t.true(spiedStatus.calledWith(500));
      t.true(
        spiedJson.calledWith({
          success: false,
          message: error.message,
        } as ErrorApiResponse)
      );
    })
  );
});

test('should handle asynchronous request', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const TEXT = `${method.toUpperCase()}_API_RESPONSE`;
      // const router = new RouterBuilder();
      router[method]((_req) => Promise.resolve(TEXT));
      const handler = router.build();
      await handler({ method: method.toUpperCase() } as NextApiRequest, res);
      t.true(spiedStatus.calledWith(200));
      t.true(
        spiedJson.calledWith({
          success: true,
          data: TEXT,
        } as SuccessApiResponse<string>)
      );
    })
  );
});

test('should handle errors thrown by asynchronous request', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const error = new Error(`${method.toUpperCase()}_API_ERROR`);
      // const router = new RouterBuilder();
      router[method]((_req) => Promise.reject(error));
      const handler = router.build();
      await handler({ method: method.toUpperCase() } as NextApiRequest, res);
      t.true(spiedStatus.calledWith(500));
      t.true(
        spiedJson.calledWith({
          success: false,
          message: error.message,
        } as ErrorApiResponse)
      );
    })
  );
});

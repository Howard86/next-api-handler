import test from 'ava';
import type { NextApiRequest, NextApiResponse } from 'next';
import sinon, { SinonSpiedInstance } from 'sinon';

import Router from './router';

const req = { method: 'GET' } as NextApiRequest;
const res = {
  status(_statusCode: number) {
    return this;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  send(_data: unknown) {},
} as unknown as NextApiResponse;

let spy: SinonSpiedInstance<typeof res>;
let router: Router;

test.before(() => {
  spy = sinon.spy(res);
});

test.beforeEach(() => {
  router = new Router();
});

test('should return 405 for empty GET route', async (t) => {
  const handler = router.build();
  await handler(req, res);
  t.true(spy.status.calledWith(405));
  t.true(spy.send.calledWith('Method GET Not Allowed'));
});

test('should return value controlled by predefined handler', async (t) => {
  const TEXT = 'GET_RESPONSE';

  router.get((_req, res) => {
    return res.status(200).send(TEXT);
  });

  const handler = router.build();
  await handler(req, res);
  t.true(spy.status.calledWith(200));
  t.true(spy.send.calledWith(TEXT));
});

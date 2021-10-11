import test from 'ava';
import type { NextApiResponse } from 'next';
import sinon, { SinonSpy } from 'sinon';

import {
  ErrorApiResponse,
  NextApiRequestWithMiddleware,
  RouterBuilder,
  SuccessApiResponse,
} from './router';

const ROUTING_METHODS = [
  'get',
  'head',
  'patch',
  'options',
  'connect',
  'delete',
  'trace',
  'post',
  'put',
] as const;

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

let router: RouterBuilder;

test.beforeEach(() => {
  spiedJson = sinon.spy(res, 'json');
  spiedStatus = sinon.spy(res, 'status');
  router = new RouterBuilder();
});

test.afterEach(() => {
  spiedJson.restore();
  spiedStatus.restore();
});

test.serial('should return 405 for all empty routes', async (t) => {
  const handler = router.build();

  await Promise.all(
    ROUTING_METHODS.map((method) => method.toUpperCase()).map(
      async (method) => {
        await handler({ method } as NextApiRequestWithMiddleware, res);
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

test.serial(
  'should return value controlled by predefined handler',
  async (t) => {
    await Promise.all(
      ROUTING_METHODS.map(async (method) => {
        const TEXT = `${method.toUpperCase()}_API_RESPONSE`;
        router[method]((_req) => TEXT);
        const handler = router.build();
        await handler(
          { method: method.toUpperCase() } as NextApiRequestWithMiddleware,
          res
        );
        t.true(spiedStatus.calledWith(200));
        t.true(
          spiedJson.calledWith({
            success: true,
            data: TEXT,
          } as SuccessApiResponse<string>)
        );
      })
    );
  }
);

test.serial('should handle errors', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const error = new Error(`${method.toUpperCase()}_API_ERROR`);
      router[method]((_req) => {
        throw error;
      });
      const handler = router.build();
      await handler(
        { method: method.toUpperCase() } as NextApiRequestWithMiddleware,
        res
      );
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

test.serial('should handle asynchronous request', async (t) => {
  await Promise.all(
    ROUTING_METHODS.map(async (method) => {
      const TEXT = `${method.toUpperCase()}_API_RESPONSE`;
      router[method]((_req) => Promise.resolve(TEXT));
      const handler = router.build();
      await handler(
        { method: method.toUpperCase() } as NextApiRequestWithMiddleware,
        res
      );
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

test.serial(
  'should handle errors thrown by asynchronous request',
  async (t) => {
    await Promise.all(
      ROUTING_METHODS.map(async (method) => {
        const error = new Error(`${method.toUpperCase()}_API_ERROR`);
        router[method]((_req) => Promise.reject(error));
        const handler = router.build();
        await handler(
          { method: method.toUpperCase() } as NextApiRequestWithMiddleware,
          res
        );
        t.true(spiedStatus.calledWith(500));
        t.true(
          spiedJson.calledWith({
            success: false,
            message: error.message,
          } as ErrorApiResponse)
        );
      })
    );
  }
);

type FakeCookie = {
  testCookie: string;
};

type FakeUser = {
  user: {
    id: string;
    name: string;
    testCookie: string;
  };
};

test.serial(
  'should accept middleware in sequence and receive values from request',
  async (t) => {
    router.get((req) => req.middleware);
    const handler = router.build();

    const cookieMiddleware = (
      _req: NextApiRequestWithMiddleware
    ): FakeCookie => ({
      testCookie: 'TEST_COOKIE',
    });
    router.use<FakeCookie>(cookieMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);
    t.true(spiedStatus.calledWith(200));
    t.true(
      spiedJson.calledWith({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
        },
      })
    );

    const userMiddleware = (req: NextApiRequestWithMiddleware): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: req.middleware.testCookie as string,
      },
    });

    router.use<FakeUser>(userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledWith(200));
    t.true(
      spiedJson.calledWith({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
          user: {
            id: '1',
            name: 'TEST_USER',
            testCookie: 'TEST_COOKIE',
          },
        },
      })
    );
  }
);

test.serial(
  'should accept middleware in parallel and receive values from request',
  async (t) => {
    router.get((req) => req.middleware);
    const handler = router.build();

    const cookieMiddleware = (
      _req: NextApiRequestWithMiddleware
    ): FakeCookie => ({
      testCookie: 'TEST_COOKIE',
    });

    const userMiddleware = (_req: NextApiRequestWithMiddleware): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: 'ANOTHER_TEST_COOKIE',
      },
    });

    router.inject<FakeCookie>(cookieMiddleware);
    router.inject<FakeUser>(userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledWith(200));
    t.true(
      spiedJson.calledWith({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
          user: {
            id: '1',
            name: 'TEST_USER',
            testCookie: 'ANOTHER_TEST_COOKIE',
          },
        },
      })
    );
  }
);

test.serial(
  'should accept middleware both in parallel & sequence and receive values from request',
  async (t) => {
    router.get((req) => req.middleware);
    const handler = router.build();

    const cookieMiddleware = (
      _req: NextApiRequestWithMiddleware
    ): FakeCookie => ({
      testCookie: 'TEST_COOKIE',
    });

    const userMiddleware = (req: NextApiRequestWithMiddleware): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: req.middleware.testCookie as string,
      },
    });

    router.inject<FakeCookie>(cookieMiddleware);
    router.use<FakeUser>(userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledWith(200));
    t.true(
      spiedJson.calledWith({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
          user: {
            id: '1',
            name: 'TEST_USER',
            testCookie: 'TEST_COOKIE',
          },
        },
      })
    );
  }
);

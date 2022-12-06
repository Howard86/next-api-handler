import test from 'ava';
import type { NextApiResponse } from 'next';
import sinon, { SinonSpy } from 'sinon';

import { RouterBuilder } from './router-builder';
import {
  ErrorApiResponse,
  NextApiRequestWithMiddleware,
  SuccessApiResponse,
} from './type';

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
  setHeader(_text: string, _allowedMethods: string[]) {
    return;
  },
  status(_statusCode: number) {
    return this;
  },
  json(_data: unknown) {
    return;
  },
  headerSent: false,
} as unknown as NextApiResponse;

let spiedJson: SinonSpy<[data: unknown], void>;
let spiedStatus: SinonSpy<[statusCode: number], NextApiResponse>;

let router: RouterBuilder;

test.before(() => {
  spiedJson = sinon.spy(res, 'json');
  spiedStatus = sinon.spy(res, 'status');
});

test.beforeEach(() => {
  router = new RouterBuilder();
});

test.afterEach(() => {
  spiedJson.resetHistory();
  spiedStatus.resetHistory();
});

test.serial('should accept showError options when its true', async (t) => {
  router = new RouterBuilder({ showMessage: true });

  router.get(() => {
    throw new Error('TEST_ERROR');
  });

  const handler = router.build();
  await handler({} as NextApiRequestWithMiddleware, res);
  t.true(spiedStatus.calledOnceWithExactly(500));
  t.true(
    spiedJson.calledOnceWithExactly({
      success: false,
      message: 'TEST_ERROR',
    } as ErrorApiResponse)
  );
});

test.serial('should accept showError options when its false', async (t) => {
  router = new RouterBuilder({ showMessage: false });

  router.get(() => {
    throw new Error('TEST_ERROR');
  });

  const handler = router.build();
  await handler({} as NextApiRequestWithMiddleware, res);
  t.true(spiedStatus.calledOnceWithExactly(500));
  t.true(
    spiedJson.calledOnceWithExactly({
      success: false,
      message: 'Internal Server Error',
    } as ErrorApiResponse)
  );
});

test.serial('should return 405 for all empty routes', async (t) => {
  const handler = router.build();
  const spiedSetHeader = sinon.spy(res, 'setHeader');

  await Promise.all(
    ROUTING_METHODS.map((method) => method.toUpperCase()).map(
      async (method) => {
        await handler({ method } as NextApiRequestWithMiddleware, res);
        t.true(spiedSetHeader.alwaysCalledWithExactly('Allow', []));
        t.true(spiedStatus.alwaysCalledWithExactly(405));
        t.true(
          spiedJson.calledWithExactly({
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
        t.true(spiedStatus.alwaysCalledWithExactly(200));
        t.true(
          spiedJson.calledWithExactly({
            success: true,
            data: TEXT,
          } as SuccessApiResponse<string>)
        );
      })
    );
  }
);

test.serial(
  'should not return values when header is already sent',
  async (t) => {
    await Promise.all(
      ROUTING_METHODS.map(async (method) => {
        const TEXT = `${method.toUpperCase()}_API_RESPONSE`;
        router[method]((_req) => TEXT);
        const handler = router.build();
        await handler(
          { method: method.toUpperCase() } as NextApiRequestWithMiddleware,
          { ...res, headersSent: true } as NextApiResponse
        );
        t.false(spiedStatus.alwaysCalledWithExactly(200));
        t.false(
          spiedJson.calledWithExactly({
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
      t.true(spiedStatus.alwaysCalledWithExactly(500));
      t.true(
        spiedJson.calledWithExactly({
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
      t.true(spiedStatus.alwaysCalledWithExactly(200));
      t.true(
        spiedJson.calledWithExactly({
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
        t.true(spiedStatus.alwaysCalledWithExactly(500));
        t.true(
          spiedJson.calledWithExactly({
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

test.serial('should accept middleware when returning void', async (t) => {
  router.get((req) => req.middleware);
  const handler = router.build();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyMiddleware = () => {};
  router.use(emptyMiddleware);

  await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);
  t.true(spiedStatus.calledOnceWithExactly(200));
  t.true(
    spiedJson.calledOnceWithExactly({
      success: true,
      data: {},
    })
  );

  spiedStatus.resetHistory();
  spiedJson.resetHistory();

  router.inject(emptyMiddleware);

  await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);
  t.true(spiedStatus.calledOnceWithExactly(200));
  t.true(
    spiedJson.calledOnceWithExactly({
      success: true,
      data: {},
    })
  );
});

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
    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
        },
      })
    );

    spiedStatus.resetHistory();
    spiedJson.resetHistory();

    const userMiddleware = (
      req: NextApiRequestWithMiddleware<FakeCookie>
    ): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: req.middleware.testCookie,
      },
    });

    router.use<FakeUser, FakeCookie>(userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
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

    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
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

    const userMiddleware = (
      req: NextApiRequestWithMiddleware<FakeCookie>
    ): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: req.middleware.testCookie,
      },
    });

    router.inject<FakeCookie>(cookieMiddleware);
    router.use<FakeUser, FakeCookie>(userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
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
  'should only inject specific RESTful method middleware',
  async (t) => {
    router.get((req) => req.middleware);
    router.post((req) => req.middleware);
    const handler = router.build();

    const cookieMiddleware = (
      _req: NextApiRequestWithMiddleware
    ): FakeCookie => ({
      testCookie: 'TEST_COOKIE',
    });

    const userMiddleware = (
      req: NextApiRequestWithMiddleware<FakeCookie>
    ): FakeUser => ({
      user: {
        id: '1',
        name: 'TEST_USER',
        testCookie: req.middleware.testCookie,
      },
    });

    router.inject<FakeCookie>('ALL', cookieMiddleware);
    router.use<FakeUser, FakeCookie>('GET', userMiddleware);

    await handler({ method: 'GET' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
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

    spiedStatus.resetHistory();
    spiedJson.resetHistory();

    await handler({ method: 'POST' } as NextApiRequestWithMiddleware, res);

    t.true(spiedStatus.calledOnceWithExactly(200));
    t.true(
      spiedJson.calledOnceWithExactly({
        success: true,
        data: {
          testCookie: 'TEST_COOKIE',
        },
      })
    );
  }
);

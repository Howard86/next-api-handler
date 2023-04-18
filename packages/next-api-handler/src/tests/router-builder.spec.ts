import { testApiHandler } from 'next-test-api-route-handler';

import { SUPPORTED_ROUTER_METHODS } from '../lib/constants';
import { RouterBuilder } from '../lib/router-builder';
import { NextApiHandlerWithMiddleware, RouterMethod } from '../lib/type';

import 'jest-extended';

describe('RouterBuilder', () => {
  let router: RouterBuilder;
  let handler: ReturnType<RouterBuilder['build']>;

  beforeEach(() => {
    router = new RouterBuilder();
    handler = router.build();
  });

  describe('router options', () => {
    const errorHandler = jest.fn((() => {
      throw new Error('TEST_ERROR');
    }) as NextApiHandlerWithMiddleware);

    it('should accept showError options when its true', async () => {
      const newRouter = new RouterBuilder({ showMessage: true });
      newRouter.get(errorHandler);

      await testApiHandler({
        handler: newRouter.build(),
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(500);
          expect(errorHandler).toHaveBeenCalledTimes(1);
          await expect(res.json()).resolves.toStrictEqual({
            success: false,
            message: 'TEST_ERROR',
          });
        },
      });
    });

    it('should accept showError options when its false', async () => {
      const newRouter = new RouterBuilder({ showMessage: false });

      newRouter.get(errorHandler);

      await testApiHandler({
        handler: newRouter.build(),
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(500);
          expect(errorHandler).toHaveBeenCalledTimes(1);
          await expect(res.json()).resolves.toStrictEqual({
            success: false,
            message: 'Internal Server Error',
          });
        },
      });
    });
  });

  describe('default handler', () => {
    it('should return 405 for all unhandled routes', async () => {
      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          await Promise.all(
            SUPPORTED_ROUTER_METHODS.map(async (method) => {
              const res = await fetch({ method });

              expect(res.status).toBe(405);
              await expect(res.json()).resolves.toStrictEqual({
                success: false,
                message: `Method ${method} Not Allowed`,
              });
            })
          );
        },
      });
    });

    it('should prevent sending response twice', async () => {
      router.get((_req, res) => {
        res.status(200).json({ message: 'TEST_MESSAGE_SENT' });

        return 'TEST_MESSAGE_UNSENT';
      });

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({
            message: 'TEST_MESSAGE_SENT',
          });
        },
      });
    });
  });

  describe('custom handler', () => {
    it('should return value controlled by custom handler', async () => {
      await Promise.all(
        SUPPORTED_ROUTER_METHODS.map(async (method) => {
          const customHandler = jest.fn(
            (() =>
              method + '_TEST_MESSAGE') as NextApiHandlerWithMiddleware<string>
          );

          router[method.toLowerCase() as Lowercase<RouterMethod>](
            customHandler
          );

          await testApiHandler({
            handler,
            test: async ({ fetch }) => {
              const res = await fetch({ method });

              expect(res.status).toBe(200);
              expect(customHandler).toHaveBeenCalledTimes(1);
              await expect(res.json()).resolves.toStrictEqual({
                success: true,
                data: method + '_TEST_MESSAGE',
              });
            },
          });
        })
      );
    });

    it('should handle error thrown by custom handler', async () => {
      await Promise.all(
        SUPPORTED_ROUTER_METHODS.map(async (method) => {
          const customHandler = jest.fn((() => {
            throw new Error(method + '_TEST_ERROR');
          }) as NextApiHandlerWithMiddleware);

          router[method.toLowerCase() as Lowercase<RouterMethod>](
            customHandler
          );

          await testApiHandler({
            handler,
            test: async ({ fetch }) => {
              const res = await fetch({ method });

              expect(res.status).toBe(500);
              expect(customHandler).toHaveBeenCalledTimes(1);
              await expect(res.json()).resolves.toStrictEqual({
                success: false,
                message: method + '_TEST_ERROR',
              });
            },
          });
        })
      );
    });

    it('should return value controlled by asynchronous handler', async () => {
      await Promise.all(
        SUPPORTED_ROUTER_METHODS.map(async (method) => {
          const customHandler = jest.fn((async () =>
            Promise.resolve(
              method + '_TEST_MESSAGE'
            )) as NextApiHandlerWithMiddleware<string>);

          router[method.toLowerCase() as Lowercase<RouterMethod>](
            customHandler
          );

          await testApiHandler({
            handler,
            test: async ({ fetch }) => {
              const res = await fetch({ method });

              expect(res.status).toBe(200);
              expect(customHandler).toHaveBeenCalledTimes(1);
              await expect(res.json()).resolves.toStrictEqual({
                success: true,
                data: method + '_TEST_MESSAGE',
              });
            },
          });
        })
      );
    });

    it('should handle error thrown by asynchronous handler', async () => {
      await Promise.all(
        SUPPORTED_ROUTER_METHODS.map(async (method) => {
          const customHandler = jest.fn((async () =>
            Promise.reject(
              new Error(method + '_TEST_ERROR')
            )) as NextApiHandlerWithMiddleware);

          router[method.toLowerCase() as Lowercase<RouterMethod>](
            customHandler
          );

          await testApiHandler({
            handler,
            test: async ({ fetch }) => {
              const res = await fetch({ method });

              expect(res.status).toBe(500);
              expect(customHandler).toHaveBeenCalledTimes(1);
              await expect(res.json()).resolves.toStrictEqual({
                success: false,
                message: method + '_TEST_ERROR',
              });
            },
          });
        })
      );
    });
  });

  describe('middleware', () => {
    type CookieMiddleware = {
      cookie: string;
    };

    type UserMiddleware = {
      user: {
        id: string;
        name: string;
        cookie: string;
      };
    };

    const mockedCookieMiddleware = jest.fn((() => ({
      cookie: 'TEST_COOKIE',
    })) as NextApiHandlerWithMiddleware<CookieMiddleware>);

    const mockedUserMiddleware = jest.fn(((req) => ({
      user: {
        id: 'TEST_ID',
        name: 'TEST_NAME',
        cookie: req.middleware.cookie,
      },
    })) as NextApiHandlerWithMiddleware<UserMiddleware, CookieMiddleware>);

    it('should accept middleware when returning void', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const customMiddleware = jest.fn(() => {});
      router.use(customMiddleware).get<string>(() => 'TEST_MESSAGE');

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(200);
          expect(customMiddleware).toHaveBeenCalledTimes(1);
          await expect(res.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_MESSAGE',
          });
        },
      });
    });

    it('should accept middleware and pass it to handler', async () => {
      router
        .use<CookieMiddleware>(mockedCookieMiddleware)
        .get<string, CookieMiddleware>((req) => req.middleware.cookie);

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(1);
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_COOKIE',
          });
        },
      });
    });

    it('should accept asynchronous middleware and pass it to handler', async () => {
      router
        .use<CookieMiddleware>(async () =>
          Promise.resolve({
            cookie: 'TEST_COOKIE',
          })
        )
        .get<string, CookieMiddleware>((req) => req.middleware.cookie);

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_COOKIE',
          });
        },
      });
    });

    it('should accept middleware in sequence and pass it to handler', async () => {
      router
        .use<CookieMiddleware>(mockedCookieMiddleware)
        .use<UserMiddleware, CookieMiddleware>(mockedUserMiddleware)
        .get<UserMiddleware['user'], UserMiddleware>(
          (req) => req.middleware.user
        );

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(1);
          expect(mockedUserMiddleware).toHaveBeenCalledTimes(1);
          expect(mockedCookieMiddleware).toHaveBeenCalledBefore(
            mockedUserMiddleware as jest.Mock
          );
          await expect(res.json()).resolves.toStrictEqual({
            success: true,
            data: {
              id: 'TEST_ID',
              name: 'TEST_NAME',
              cookie: 'TEST_COOKIE',
            },
          });
        },
      });
    });

    it('should accept middleware in parallel and pass it to handler', async () => {
      router
        .inject<CookieMiddleware>(mockedCookieMiddleware)
        .inject<UserMiddleware, CookieMiddleware>(mockedUserMiddleware)
        .get<UserMiddleware['user'], UserMiddleware>(
          (req) => req.middleware.user
        );

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const res = await fetch();

          expect(res.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(1);
          expect(mockedUserMiddleware).toHaveBeenCalledTimes(1);

          await expect(res.json()).resolves.toStrictEqual({
            success: true,
            data: {
              id: 'TEST_ID',
              name: 'TEST_NAME',
            },
          });
        },
      });
    });

    it('should inject middleware for all RESTful API routes', async () => {
      router
        .use<CookieMiddleware>('ALL', mockedCookieMiddleware)
        .get<string, CookieMiddleware>((req) => req.middleware.cookie)
        .post<string, CookieMiddleware>((req) => req.middleware.cookie);

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const getResponse = await fetch();

          expect(getResponse.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(1);

          await expect(getResponse.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_COOKIE',
          });

          const postResponse = await fetch({ method: 'POST' });

          expect(postResponse.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(2);

          await expect(postResponse.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_COOKIE',
          });
        },
      });
    });

    it('should allow injecting middleware for a specific RESTful API route', async () => {
      router
        .use<CookieMiddleware>('POST', mockedCookieMiddleware)
        .get<string, CookieMiddleware>((req) => req.middleware.cookie)
        .post<string, CookieMiddleware>((req) => req.middleware.cookie);

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          const getResponse = await fetch();

          expect(getResponse.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(0);

          await expect(getResponse.json()).resolves.toStrictEqual({
            success: true,
          });

          const postResponse = await fetch({ method: 'POST' });

          expect(postResponse.status).toBe(200);
          expect(mockedCookieMiddleware).toHaveBeenCalledTimes(1);

          await expect(postResponse.json()).resolves.toStrictEqual({
            success: true,
            data: 'TEST_COOKIE',
          });
        },
      });
    });
  });
});

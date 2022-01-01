import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { ApiErrorHandler, makeErrorHandler } from './error-handler';
import { MethodNotAllowedException } from './http-exceptions';

/**
 *  an utility type to shorten writing Record<string, T = unknown>
 */
export type TypedObject<T = unknown> = Record<string, T>;

/**
 *  a standard next.js api handler but with req.middleware available
 *  see [official doc](https://nextjs.org/docs/api-routes/introduction) for more details
 */
export type NextApiHandlerWithMiddleware<
  T = unknown,
  M extends TypedObject = TypedObject
> = (
  req: NextApiRequestWithMiddleware<M>,
  res: NextApiResponse
) => T | Promise<T>;

/**
 *  a standard next.js api request but with req.middleware available
 */
export interface NextApiRequestWithMiddleware<
  M extends TypedObject = TypedObject
> extends NextApiRequest {
  middleware: M;
}

/**
 *  all api response combines success response & error response
 */
export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;

/**
 *  api response that has http status code 2xx with data
 */
export type SuccessApiResponse<T> = { success: true; data: T };

/**
 *  api response that has http status code 4xx or 5xx with error message
 */
export type ErrorApiResponse = { success: false; message: string };

/**
 * RouterBuilder options
 */
export type RouterBuilderOptions = Partial<{
  error: ApiErrorHandler;
  shoeMessage: boolean;
}>;

/**
 * A router builder is next api handler builder that exposes express-like api.
 *
 * ### Example (basic usage)
 * ```js
 * // In next.js /pages/api/[route]
 * import { RouterBuilder } from 'next-api-handler'
 * const router = new RouterBuilder().build()
 * export default router
 * ```
 *
 * ### Example (add RESTful method)
 * ```js
 * import { RouterBuilder } from 'next-api-handler'
 * const router = new RouterBuilder().get((req, res) => "RESPONSE")
 * export default router
 * ```
 *
 * ### Example (add async method)
 * ```js
 * import { RouterBuilder } from 'next-api-handler'
 * const handler = new RouterBuilder().get(async (req, res) => "ASYNC RESPONSE")
 * export default router
 * ```
 *
 * @returns a builder that can build a next.js api handler.
 */
export class RouterBuilder {
  private readonly route: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NextApiHandlerWithMiddleware<unknown, any>
  > = {};
  private readonly middlewareList: NextApiHandlerWithMiddleware<
    TypedObject,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >[] = [];
  private readonly middlewareQueue: NextApiHandlerWithMiddleware<
    TypedObject,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >[] = [];
  private readonly routerOptions = {} as Required<RouterBuilderOptions>;

  constructor(options: RouterBuilderOptions = {}) {
    this.routerOptions.error =
      options.error ||
      makeErrorHandler(
        typeof options.shoeMessage === 'boolean'
          ? options.shoeMessage
          : process.env.NODE_ENV !== 'production'
      );
  }

  get<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('GET', handler);
  }

  head<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('HEAD', handler);
  }

  patch<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('PATCH', handler);
  }

  options<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('OPTIONS', handler);
  }

  connect<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('CONNECT', handler);
  }

  delete<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('DELETE', handler);
  }

  trace<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('TRACE', handler);
  }

  post<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('POST', handler);
  }

  put<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.add('PUT', handler);
  }

  use<T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    this.middlewareQueue.push(handler);
    return this;
  }

  inject<
    T extends TypedObject = TypedObject,
    M extends TypedObject = TypedObject
  >(handler: NextApiHandlerWithMiddleware<T, M>): RouterBuilder {
    this.middlewareList.push(handler);
    return this;
  }

  build(): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
      try {
        const handler = this.route[req.method || 'GET'];

        if (!handler) {
          res.setHeader('Allow', Object.keys(this.route));
          throw new MethodNotAllowedException(
            `Method ${req.method} Not Allowed`
          );
        }

        (req as NextApiRequestWithMiddleware).middleware = {};

        if (this.middlewareList.length > 0) {
          await this.handleMiddlewareList(
            req as NextApiRequestWithMiddleware,
            res
          );
        }

        if (this.middlewareQueue.length > 0) {
          await this.handleMiddlewareQueue(
            req as NextApiRequestWithMiddleware,
            res
          );
        }

        const data = await Promise.resolve(
          handler(req as NextApiRequestWithMiddleware, res)
        );
        return res.status(200).json({
          success: true,
          data,
        });
      } catch (error) {
        this.routerOptions.error(req, res, error as Error);
      }
    };
  }

  private async handleMiddlewareQueue(
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void> {
    for (const middleware of this.middlewareQueue) {
      const middlewareValue = await Promise.resolve(middleware(req, res));

      for (const middlewareKey of Object.keys(middlewareValue)) {
        req.middleware[middlewareKey] = middlewareValue[middlewareKey];
      }
    }
  }

  private async handleMiddlewareList(
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void> {
    await Promise.all(
      this.middlewareList.map(async (middleware) => {
        const middlewareValue = await Promise.resolve(middleware(req, res));

        for (const middlewareKey of Object.keys(middlewareValue)) {
          req.middleware[middlewareKey] = middlewareValue[middlewareKey];
        }
      })
    );
  }

  private add<T, M extends TypedObject>(
    method: string,
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    this.route[method] = handler;
    return this;
  }
}

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
  showMessage: boolean;
}>;

export type RouterMethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'OPTIONS'
  | 'CONNECT'
  | 'DELETE'
  | 'TRACE'
  | 'POST'
  | 'PUT';

const DEFAULT_MIDDLEWARE_ROUTER_METHOD = 'ALL' as const;

export type MiddlewareRouterMethod =
  | typeof DEFAULT_MIDDLEWARE_ROUTER_METHOD
  | RouterMethod;

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
  private readonly routeHandlerMap: Partial<
    Record<
      RouterMethod,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NextApiHandlerWithMiddleware<unknown, any>
    >
  > = {};
  private readonly middlewareParallelListMap: Partial<
    Record<
      MiddlewareRouterMethod,
      NextApiHandlerWithMiddleware<
        TypedObject,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
      >[]
    >
  > = {};
  private readonly middlewareQueueMap: Partial<
    Record<
      MiddlewareRouterMethod,
      NextApiHandlerWithMiddleware<
        TypedObject,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
      >[]
    >
  > = {};
  private readonly routerOptions = {} as Required<RouterBuilderOptions>;

  constructor(options: RouterBuilderOptions = {}) {
    this.applyErrorHandler(options);
  }

  private applyErrorHandler(options: RouterBuilderOptions) {
    this.routerOptions.error =
      options.error ||
      makeErrorHandler(
        typeof options.showMessage === 'boolean'
          ? options.showMessage
          : process.env.NODE_ENV !== 'production'
      );
  }

  build(): NextApiHandler {
    return async (
      rawReq: NextApiRequest,
      res: NextApiResponse<ApiResponse>
    ) => {
      try {
        const routerMethod = (rawReq.method || 'GET') as RouterMethod;
        const handler = this.routeHandlerMap[routerMethod];

        if (!handler) {
          res.setHeader('Allow', Object.keys(this.routeHandlerMap));
          throw new MethodNotAllowedException(
            `Method ${routerMethod} Not Allowed`
          );
        }

        const req = rawReq as NextApiRequestWithMiddleware;
        req.middleware = {};

        await Promise.all(
          this.getMiddlewarePromiseList(
            DEFAULT_MIDDLEWARE_ROUTER_METHOD,
            req,
            res
          ).concat(this.getMiddlewarePromiseList(routerMethod, req, res))
        );

        await this.resolveMiddlewareQueue(
          DEFAULT_MIDDLEWARE_ROUTER_METHOD,
          req,
          res
        );
        await this.resolveMiddlewareQueue(routerMethod, req, res);

        const data = await Promise.resolve(handler(req, res));

        if (!res.headersSent) {
          res.status(200).json({
            success: true,
            data,
          });
        }
      } catch (error) {
        this.routerOptions.error(rawReq, res, error as Error);
      }
    };
  }

  private getMiddlewarePromiseList(
    method: MiddlewareRouterMethod,
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void>[] {
    if (!Array.isArray(this.middlewareParallelListMap[method])) return [];

    return this.middlewareParallelListMap[method]!.map(async (middleware) => {
      const middlewareValue = await Promise.resolve(middleware(req, res));

      for (const middlewareKey of Object.keys(middlewareValue)) {
        req.middleware[middlewareKey] = middlewareValue[middlewareKey];
      }
    });
  }

  private async resolveMiddlewareQueue(
    method: MiddlewareRouterMethod,
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void> {
    if (!Array.isArray(this.middlewareQueueMap[method])) return;

    for (const middleware of this.middlewareQueueMap[method]!) {
      const middlewareValue = await Promise.resolve(middleware(req, res));

      for (const middlewareKey of Object.keys(middlewareValue)) {
        req.middleware[middlewareKey] = middlewareValue[middlewareKey];
      }
    }
  }

  use<T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    middlewareRouterMethod: MiddlewareRouterMethod,
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder;
  use<T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder;
  use<T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    methodOrHandler:
      | MiddlewareRouterMethod
      | NextApiHandlerWithMiddleware<T, M>,
    handler?: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    const isHandler = typeof methodOrHandler !== 'string';

    this.addToPartialArrayMap(
      this.middlewareQueueMap,
      isHandler ? DEFAULT_MIDDLEWARE_ROUTER_METHOD : methodOrHandler,
      isHandler ? methodOrHandler : handler
    );

    return this;
  }

  inject<
    T extends TypedObject = TypedObject,
    M extends TypedObject = TypedObject
  >(
    middlewareRouterMethod: MiddlewareRouterMethod,
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder;
  inject<
    T extends TypedObject = TypedObject,
    M extends TypedObject = TypedObject
  >(handler: NextApiHandlerWithMiddleware<T, M>): RouterBuilder;
  inject<
    T extends TypedObject = TypedObject,
    M extends TypedObject = TypedObject
  >(
    methodOrHandler:
      | MiddlewareRouterMethod
      | NextApiHandlerWithMiddleware<T, M>,
    handler?: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    const isSingleParam = typeof methodOrHandler !== 'string';

    this.addToPartialArrayMap(
      this.middlewareParallelListMap,
      isSingleParam ? DEFAULT_MIDDLEWARE_ROUTER_METHOD : methodOrHandler,
      isSingleParam ? methodOrHandler : handler
    );

    return this;
  }

  private addToPartialArrayMap<K extends string, V>(
    map: Partial<Record<K, V[]>>,
    key: K,
    value: V
  ): void {
    if (Array.isArray(map[key])) {
      map[key]!.push(value);
    } else {
      map[key] = [value];
    }
  }

  get<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('GET', handler);
  }

  head<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('HEAD', handler);
  }

  patch<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('PATCH', handler);
  }

  options<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('OPTIONS', handler);
  }

  connect<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('CONNECT', handler);
  }

  delete<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('DELETE', handler);
  }

  trace<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('TRACE', handler);
  }

  post<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('POST', handler);
  }

  put<T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    return this.addRouterMethod('PUT', handler);
  }

  private addRouterMethod<T, M extends TypedObject>(
    method: RouterMethod,
    handler: NextApiHandlerWithMiddleware<T, M>
  ): RouterBuilder {
    this.routeHandlerMap[method] = handler;
    return this;
  }
}

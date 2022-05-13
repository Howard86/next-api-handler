import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import { makeErrorHandler } from './error-handler';
import { ExpressLikeRouter } from './express-like-router';
import { MethodNotAllowedException } from './http-exceptions';
import {
  ApiResponse,
  MiddlewareRouterMethod,
  NextApiRequestWithMiddleware,
  RouterBuilderOptions,
  RouterMethod,
} from './type';

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
export class RouterBuilder extends ExpressLikeRouter {
  private readonly routerOptions = {} as Required<RouterBuilderOptions>;

  constructor(options: RouterBuilderOptions = {}) {
    super();
    this.applyErrorHandler(options);
  }

  public build(): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
      try {
        const routerMethod = (req.method || 'GET') as RouterMethod;
        const handler = this.routeHandlerMap[routerMethod];

        if (!handler) {
          res.setHeader('Allow', Object.keys(this.routeHandlerMap));
          throw new MethodNotAllowedException(
            `Method ${routerMethod} Not Allowed`
          );
        }

        await this.resolveMiddlewareListAndQueue(
          routerMethod,
          req as NextApiRequestWithMiddleware,
          res
        );

        const data = await handler(req as NextApiRequestWithMiddleware, res);

        this.handleSendSuccessResponse(res, data);
      } catch (error) {
        this.routerOptions.error(req, res, error as Error);
      }
    };
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

  private handleSendSuccessResponse<T>(
    res: NextApiResponse<ApiResponse<T>>,
    data: T
  ) {
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        data,
      });
    }
  }

  private async resolveMiddlewareListAndQueue(
    routerMethod: RouterMethod,
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void> {
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
}

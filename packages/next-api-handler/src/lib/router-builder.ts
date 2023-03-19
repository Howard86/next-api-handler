import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { ApiLogger, DefaultApiLogger } from './api-logger';
import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import { makeErrorHandler } from './error-handler';
import { ExpressLikeRouter } from './express-like-router';
import { HttpException, MethodNotAllowedException } from './http-exceptions';
import {
  ApiResponse,
  MiddlewareRouterMethod,
  NextApiRequestWithMiddleware,
  RouterBuilderOptions,
  RouterMethod,
} from './type';

const enum HandlerLogType {
  Initiate,
  Sent,
  Error,
  Success,
}

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
  private readonly logger: ApiLogger;

  constructor(options: RouterBuilderOptions = {}) {
    super();
    this.applyErrorHandler(options);
    this.logger = options.logger || new DefaultApiLogger(options.loggerOption);
  }

  public build(): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
      const initiatedTime = Date.now();
      const routerMethod = (req.method || 'GET') as RouterMethod;

      this.logHandler(HandlerLogType.Initiate, routerMethod, req.url);

      try {
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

        if (res.headersSent) {
          this.logHandler(
            HandlerLogType.Sent,
            routerMethod,
            req.url,
            initiatedTime
          );
        } else {
          this.logHandler(
            HandlerLogType.Success,
            routerMethod,
            req.url,
            initiatedTime
          );
          res.status(200).json({
            success: true,
            data,
          });
        }
      } catch (error) {
        this.logHandler(
          HandlerLogType.Error,
          routerMethod,
          req.url,
          initiatedTime,
          error as Error
        );
        this.routerOptions.error(req, res, error as Error);
      }
    };
  }

  private logHandler(
    type: HandlerLogType,
    routerMethod: RouterMethod,
    url?: string,
    initiatedTime?: number,
    error?: Error
  ) {
    const meta = this.getLogFormattedMessage(routerMethod, url, initiatedTime);

    switch (type) {
      case HandlerLogType.Initiate:
        this.logger.debug(`Initiated ${meta}`);
        break;

      case HandlerLogType.Sent:
        this.logger.warn(`Response already sent for ${meta}`);
        break;

      case HandlerLogType.Success:
        this.logger.info(`Successfully handled ${meta}`);
        break;

      case HandlerLogType.Error: {
        if (error instanceof HttpException) {
          const message = `Caught HttpException ${error.status} ${error.message} from ${meta}`;

          if (error.status < 500) {
            this.logger.warn(message);
          } else {
            this.logger.error(message);
          }

          break;
        }

        this.logger.error(
          `Caught unexpected error from ${meta}, trace: ${error?.stack}`
        );

        break;
      }

      default:
        break;
    }
  }

  private getLogFormattedMessage(
    RouterMethod: RouterMethod,
    url?: string,
    initiatedTime?: number
  ) {
    if (!initiatedTime) return `${RouterMethod} ${url}`;

    return `${RouterMethod} ${url} in ${Date.now() - initiatedTime}ms`;
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
    const list = this.middlewareParallelListMap[method];

    if (!Array.isArray(list)) return [];

    this.logger.debug(`Resolved ${list.length} ${method} middleware list`);

    return list.map(async (middleware) => {
      const middlewareValue = await middleware(req, res);

      if (middlewareValue) {
        for (const middlewareKey of Object.keys(middlewareValue)) {
          req.middleware[middlewareKey] = middlewareValue[middlewareKey];
        }
      }
    });
  }

  private async resolveMiddlewareQueue(
    method: MiddlewareRouterMethod,
    req: NextApiRequestWithMiddleware,
    res: NextApiResponse<ApiResponse>
  ): Promise<void> {
    const queue = this.middlewareQueueMap[method];
    if (!Array.isArray(queue)) return;

    this.logger.debug(`Resolved ${queue.length} ${method} middleware queue`);

    for (const middleware of queue) {
      const middlewareValue = await middleware(req, res);

      if (middlewareValue) {
        for (const middlewareKey of Object.keys(middlewareValue)) {
          req.middleware[middlewareKey] = middlewareValue[middlewareKey];
        }
      }
    }
  }
}

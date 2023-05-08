import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { ApiLogger, DefaultApiLogger } from './api-logger';
import {
  DEFAULT_MIDDLEWARE_ROUTER_METHOD,
  SUPPORTED_ROUTER_METHODS,
} from './constants';
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

/**
 * The types of logs that can be recorded for the router handler
 * @readonly
 * @enum {number}
 */
const enum HandlerLogType {
  Skip,
  Initiate,
  Sent,
  Error,
  Success,
}

/**
 * A router builder is a Next.js API handler builder that exposes an Express-like API.
 *
 * @class
 * @extends {ExpressLikeRouter}
 * @public
 * @example
 * ```ts
 * import { RouterBuilder, ForbiddenException } from 'next-api-handler';
 * import { createUser, type User } from '@/services/user';
 *
 * const router = new RouterBuilder();
 *
 * router
 *  .get<string>(() => 'Hello World!')
 *  .post<User>(async (req) => createUser(req.body))
 *  .delete(() => {
 *    throw new ForbiddenException();
 *  });
 *
 * export default router.build();
 * ```
 */
export class RouterBuilder extends ExpressLikeRouter {
  /**
   * Options for configuring the router builder
   * @private
   * @type {Required<RouterBuilderOptions>}
   */
  private readonly routerOptions: Required<RouterBuilderOptions> =
    {} as Required<RouterBuilderOptions>;

  /**
   * The logger used by the router builder
   * @private
   * @type {ApiLogger}
   */
  private readonly logger: ApiLogger;

  /**
   * Create a new instance of the RouterBuilder
   * @param {RouterBuilderOptions} options - Options to configure the router builder
   */
  constructor(options: RouterBuilderOptions = {}) {
    super();
    this.applyErrorHandler(options);
    this.logger = options.logger || new DefaultApiLogger(options.loggerOption);
  }

  /**
   * Builds a Next.js API handler
   * @returns {NextApiHandler} - a Next.js API handler
   */
  public build(): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
      const initiatedTime = Date.now();
      const routerMethod = (req.method || 'GET') as RouterMethod;

      this.logHandler(HandlerLogType.Initiate, routerMethod, req.url);

      try {
        if (!SUPPORTED_ROUTER_METHODS.includes(routerMethod)) {
          await this.resolveMiddlewareListAndQueue(
            routerMethod,
            req as NextApiRequestWithMiddleware,
            res
          );

          this.logHandler(
            HandlerLogType.Skip,
            routerMethod,
            req.url,
            initiatedTime
          );

          res.end();
          return;
        }

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
          return;
        }

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

  /**
   * Logs a handler event
   * @private
   * @param {HandlerLogType} type - The type of log event to record
   * @param {RouterMethod} routerMethod - The router method being called
   * @param {string} [url] - The URL for the router method being called
   * @param {number} [initiatedTime] - The time at which the router method was initiated
   * @param {Error} [error] - An error object associated with the event (if applicable)
   */
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

      case HandlerLogType.Skip:
        this.logger.debug(`Skipped ${meta}`);
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

  /**
   * Gets a formatted log message for the current handler event
   * @private
   * @param {RouterMethod} RouterMethod - The router method being called
   * @param {string} [url] - The URL for the router method being called
   * @param {number} [initiatedTime] - The time at which the router method was initiated
   * @returns {string} - A formatted log message
   */
  private getLogFormattedMessage(
    RouterMethod: RouterMethod,
    url?: string,
    initiatedTime?: number
  ) {
    if (!initiatedTime) return `${RouterMethod} ${url}`;

    return `${RouterMethod} ${url} in ${Date.now() - initiatedTime}ms`;
  }

  /**
   * Applies the error handler to the router builder
   * @private
   * @param {RouterBuilderOptions} options - Options to configure the router builder
   */
  private applyErrorHandler(options: RouterBuilderOptions) {
    this.routerOptions.error =
      options.error ||
      makeErrorHandler(
        typeof options.showMessage === 'boolean'
          ? options.showMessage
          : process.env.NODE_ENV !== 'production'
      );
  }

  /**
   * Resolves the middleware list and queue for the current router method
   * @private
   * @param {RouterMethod} routerMethod - The router method being called
   * @param {NextApiRequestWithMiddleware} req - The Next.js API request object with middleware support
   * @param {NextApiResponse<ApiResponse>} res - The Next.js API response object
   * @returns {Promise<void>} - A promise that resolves when the middleware list and queue are complete
   */
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

  /**
   * Gets a list of middleware promises for the current router method
   * @private
   * @param {MiddlewareRouterMethod} method - The middleware router method being called
   * @param {NextApiRequestWithMiddleware} req - The Next.js API request object with middleware support
   * @param {NextApiResponse<ApiResponse>} res - The Next.js API response object
   * @returns {Promise<void>[]} - An array of promises that resolve when the middleware functions complete
   */
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

  /**
   * Resolves the middleware queue for the current router method
   * @private
   * @param {MiddlewareRouterMethod} method - The middleware router method being called
   * @param {NextApiRequestWithMiddleware} req - The Next.js API request object with middleware support
   * @param {NextApiResponse<ApiResponse>} res - The Next.js API response object
   * @returns {Promise<void>} - A promise that resolves when the middleware queue is complete
   */
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

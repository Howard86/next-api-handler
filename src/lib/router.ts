import type { NextApiRequest, NextApiResponse } from 'next';

/**
 *  public builder method of RouterBuilder that accepts next.js handler
 *  and return RouterBuilder itself
 */
export type RouterHandler<T = unknown> = (
  handler: NextApiHandler<T>
) => RouterBuilder;

/**
 *  a standard next.js api handler,
 *  see [official doc](https://nextjs.org/docs/api-routes/introduction) for more details
 */
export type NextApiHandler<T = unknown> = (
  req: NextApiRequestWithMiddleware,
  res?: NextApiResponse
) => T | Promise<T>;

export interface NextApiRequestWithMiddleware<T = unknown>
  extends NextApiRequest {
  middleware: Record<string, T>;
}

export type NextApiHandlerWithMiddleware<T = unknown, M = unknown> = (
  req: NextApiRequestWithMiddleware<M>,
  res: NextApiResponse<T>
) => void | Promise<void>;

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
 * A router builder is next api handler builder that expose express-like api.
 *
 * ### Example (basic usage)
 * ```js
 * // In next.js /pages/api/[route]
 * import { RouterBuilder } from 'next-api-handler'
 * const handler = new RouterBuilder().build()
 * export default handler
 * ```
 *
 * ### Example (add RESTful method)
 * ```js
 * import { RouterBuilder } from 'next-api-handler'
 * const handler = new RouterBuilder().get((req, res) => "RESPONSE")
 * export default handler
 * ```
 *
 * ### Example (add async method)
 * ```js
 * import { RouterBuilder } from 'next-api-handler'
 * const handler = new RouterBuilder().get(async (req, res) => "ASYNC RESPONSE")
 * export default handler
 * ```
 *
 * @returns a builder that can build a next.js api handler.
 */
export class RouterBuilder {
  private readonly route: Record<string, NextApiHandler> = {};
  private readonly middlewareQueue: NextApiHandler<Record<string, unknown>>[] =
    [];

  get<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('GET', handler);
  }

  head<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('HEAD', handler);
  }

  patch<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('PATCH', handler);
  }

  options<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('OPTIONS', handler);
  }

  connect<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('CONNECT', handler);
  }

  delete<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('DELETE', handler);
  }

  trace<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('TRACE', handler);
  }

  post<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('POST', handler);
  }

  put<T = unknown>(handler: NextApiHandler<T>): RouterBuilder {
    return this.add('PUT', handler);
  }

  use<T extends Record<string, unknown> = Record<string, unknown>>(
    handler: NextApiHandler<T>
  ): RouterBuilder {
    this.middlewareQueue.push(handler);
    return this;
  }

  build(): NextApiHandlerWithMiddleware {
    return async (
      req: NextApiRequestWithMiddleware,
      res: NextApiResponse<ApiResponse>
    ) => {
      const handler = this.route[req.method as string];

      if (!handler) {
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`,
        });
      }

      try {
        for (const middleware of this.middlewareQueue) {
          const middlewareValue = await Promise.resolve(middleware(req, res));
          req.middleware = { ...req.middleware, ...middlewareValue };
        }

        const data = await Promise.resolve(handler(req, res));
        return res.status(200).json({
          success: true,
          data,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    };
  }

  private add<T = unknown>(
    method: string,
    handler: NextApiHandler<T>
  ): RouterBuilder {
    this.route[method] = handler;
    return this;
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiLogger, DefaultApiLoggerOption } from './api-logger';
import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import { ApiErrorHandler } from './error-handler';

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
) => T | Promise<T> | void;

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
  logger: ApiLogger;
  loggerOption: DefaultApiLoggerOption;
}>;

export type InternalMiddlewareMap = Partial<
  Record<
    MiddlewareRouterMethod,
    NextApiHandlerWithMiddleware<
      TypedObject,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >[]
  >
>;

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

export type MiddlewareRouterMethod =
  | typeof DEFAULT_MIDDLEWARE_ROUTER_METHOD
  | RouterMethod;

export type AddMiddleware<R> = {
  <T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    method: MiddlewareRouterMethod,
    handler: NextApiHandlerWithMiddleware<T, M>
  ): R;
  <T extends TypedObject = TypedObject, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ): R;
};

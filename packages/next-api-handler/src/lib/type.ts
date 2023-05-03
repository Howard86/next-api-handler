import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiLogger, DefaultApiLoggerOption } from './api-logger';
import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import { ApiErrorHandler } from './error-handler';

/**
 * An object with key-value pairs, where keys are strings and values are of type `T`.
 */
export type TypedObject<T = unknown> = Record<string, T>;

/**
 * The Next.js API request with `req.middleware` available.
 */
export interface NextApiRequestWithMiddleware<
  M extends TypedObject = TypedObject
> extends NextApiRequest {
  /**
   * An object containing middleware data.
   */
  middleware: M;
}

/**
 * A standard Next.js API handler with `req.middleware` available.
 * @typeparam T The type of the response data.
 * @typeparam M The type of the middleware data.
 * @param req The Next.js API request object.
 * @param res The Next.js API response object.
 * @returns The response data or a Promise that resolves to the response data.
 */
export type NextApiHandlerWithMiddleware<
  T = unknown,
  M extends TypedObject = TypedObject
> = (
  req: NextApiRequestWithMiddleware<M>,
  res: NextApiResponse
) => T | Promise<T> | void;

/**
 * An HTTP API response.
 * @typeparam T The type of the response data.
 */
export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;

/**
 * An HTTP API success response with data.
 * @typeparam T The type of the response data.
 */
export type SuccessApiResponse<T> = { success: true; data: T };

/**
 * An HTTP API error response with a message.
 */
export type ErrorApiResponse = { success: false; message: string };

/**
 * A custom HTTP method that can be used to define middleware.
 */
export type MiddlewareRouterMethod =
  | typeof DEFAULT_MIDDLEWARE_ROUTER_METHOD
  | RouterMethod;

/**
 * The options for creating a router builder.
 * @property {ApiErrorHandler} error - The error handler to use.
 * @property {boolean} showMessage - Whether to show error messages in the response. Defaults to `true`.
 * @property {ApiLogger} logger - The logger to use.
 * @property {DefaultApiLoggerOption} loggerOption - The logger options to use.
 */
export type RouterBuilderOptions = Partial<{
  error: ApiErrorHandler;
  showMessage: boolean;
  logger: ApiLogger;
  loggerOption: DefaultApiLoggerOption;
}>;

/**
 * The available HTTP methods for adding routes to a router builder.
 */
export type RouterMethod = 'GET' | 'PATCH' | 'DELETE' | 'POST' | 'PUT';

/**
 * An object representing middleware that can be added to a router builder.
 * The keys represent the middleware router method (e.g. 'ALL') and the values are arrays of middleware functions.
 */
export type InternalMiddlewareMap<
  T extends TypedObject = TypedObject,
  M extends TypedObject = TypedObject
> = Partial<
  Record<MiddlewareRouterMethod, NextApiHandlerWithMiddleware<T | void, M>[]>
>;

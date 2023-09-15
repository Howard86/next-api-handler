import type { NextApiHandler } from 'next';

import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import {
  InternalMiddlewareMap,
  MiddlewareRouterMethod,
  NextApiHandlerWithMiddleware,
  RouterMethod,
  TypedObject,
} from './type';

/**
 * A class that provides a builder pattern for creating an Express-like API router.
 *
 * @remarks
 * The `ExpressLikeRouter` class provides a way to create an API router with support for middleware.
 *
 * @example
 * ```
 * class MyRouter extends ExpressLikeRouter {
 *   public build(): NextApiHandler {
 *     return async (req, res) => {
 *       res.status(200).json({ message: 'Hello, world!' });
 *     };
 *   }
 * }
 * ```
 */
export abstract class ExpressLikeRouter {
  /**
   * An object containing middleware functions that are executed in parallel for each request.
   * @private
   * @type {InternalMiddlewareMap}
   */
  protected readonly middlewareParallelListMap: InternalMiddlewareMap = {};

  /**
   * An object containing middleware functions that are executed sequentially for each request.
   * @private
   * @type {InternalMiddlewareMap}
   * @remarks
   * The middleware functions are executed in the order they are added to the map.
   */
  protected readonly middlewareQueueMap: InternalMiddlewareMap = {};

  /**
   * A partial object containing route handlers for each HTTP method.
   * @protected
   * @type {Partial<Record<RouterMethod, NextApiHandlerWithMiddleware>>}
   */
  protected readonly routeHandlerMap: Partial<
    Record<
      RouterMethod,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NextApiHandlerWithMiddleware<unknown, any>
    >
  > = {};

  /**
   * Adds a middleware function to the router.
   *
   * @param {MiddlewareRouterMethod | NextApiHandlerWithMiddleware<T, M>} methodOrHandler - Either the middleware router method to use, or the middleware function to add
   * @param {NextApiHandlerWithMiddleware<T, M>} [handler] - The middleware function to add (if `methodOrHandler` is a middleware router method)
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly use = this.addMiddleware(this.middlewareQueueMap);

  /**
   * Adds a middleware function to the router that will be executed in parallel with other middleware functions.
   *
   * @param {MiddlewareRouterMethod | NextApiHandlerWithMiddleware<T, M>} methodOrHandler - Either the middleware router method to use, or the middleware function to add
   * @param {NextApiHandlerWithMiddleware<T, M>} [handler] - The middleware function to add (if `methodOrHandler` is a middleware router method)
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly inject = this.addMiddleware(this.middlewareParallelListMap);

  /**
   * Adds a route handler for the `GET` HTTP method.
   *
   * @param {NextApiHandlerWithMiddleware<T, M>} handler - The route handler function
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly get = this.addRouterMethod('GET');

  /**
   * Adds a route handler for the `PATCH` HTTP method.
   *
   * @param {NextApiHandlerWithMiddleware<T, M>} handler - The route handler function
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly patch = this.addRouterMethod('PATCH');

  /**
   * Adds a route handler for the `DELETE` HTTP method.
   *
   * @param {NextApiHandlerWithMiddleware<T, M>} handler - The route handler function
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly delete = this.addRouterMethod('DELETE');

  /**
   * Adds a route handler for the `POST` HTTP method.
   *
   * @param {NextApiHandlerWithMiddleware<T, M>} handler - The route handler function
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly post = this.addRouterMethod('POST');

  /**
   * Adds a route handler for the `PUT` HTTP method.
   *
   * @param {NextApiHandlerWithMiddleware<T, M>} handler - The route handler function
   * @returns {ExpressLikeRouter} - The `ExpressLikeRouter` instance, for method chaining
   */
  readonly put = this.addRouterMethod('PUT');

  /**
   * Builds a `NextApiHandler` function that can be used by Next.js.
   *
   * @returns {NextApiHandler} - The `NextApiHandler` function that can be used by Next.js
   *
   * @abstract
   */
  public abstract build(): NextApiHandler;

  /**
   * Adds a middleware function to a middleware map.
   *
   * @private
   *
   * @param {InternalMiddlewareMap} middlewareMap - The middleware map to add the middleware function to
   * @returns {(AddMiddleware<ExpressLikeRouter>)} - The `addMiddleware` function that can add middleware to the specified middleware map
   */
  private addMiddleware(
    middlewareMap: InternalMiddlewareMap
  ): <
    T extends TypedObject | void = TypedObject,
    M extends TypedObject = TypedObject,
  >(
    methodOrHandler:
      | MiddlewareRouterMethod
      | NextApiHandlerWithMiddleware<T, M>,
    handler?: NextApiHandlerWithMiddleware<T, M>
  ) => ExpressLikeRouter {
    return (methodOrHandler, handler?) => {
      const isSingleParam = typeof methodOrHandler !== 'string';

      this.addOrSetPartialArrayMap(
        middlewareMap,
        isSingleParam ? DEFAULT_MIDDLEWARE_ROUTER_METHOD : methodOrHandler,
        isSingleParam
          ? methodOrHandler
          : (handler as NextApiHandlerWithMiddleware)
      );

      return this;
    };
  }

  /**
   * Adds a route handler for a specified HTTP method.
   *
   * @private
   *
   * @param {RouterMethod} method - The HTTP method to add the route handler for
   * @returns {(handler: NextApiHandlerWithMiddleware) => ExpressLikeRouter} - The `addRouterMethod` function that can add a route handler for the specified HTTP method
   *
   */
  private addRouterMethod(
    method: RouterMethod
  ): <T, M extends TypedObject = TypedObject>(
    handler: NextApiHandlerWithMiddleware<T, M>
  ) => ExpressLikeRouter {
    return (handler) => {
      this.routeHandlerMap[method] = handler;
      return this;
    };
  }

  /**
   * Adds or sets an item in a partial map as an array.
   *
   * @private
   *
   * @template K - The type of the keys in the partial map
   * @template V - The type of the values in the partial map
   *
   * @param {Partial<Record<K, V[]>>} partialMap - The partial map to add or set the item in
   * @param {K} mapKey - The key to add or set the item under
   * @param {V} mapValue - The value to add or set in the partial map
   */
  private addOrSetPartialArrayMap<K extends string, V>(
    partialMap: Partial<Record<K, V[]>>,
    mapKey: K,
    mapValue: V
  ) {
    const items = partialMap[mapKey];
    if (Array.isArray(items)) {
      items.push(mapValue);
    } else {
      partialMap[mapKey] = [mapValue];
    }
  }
}

import type { NextApiHandler } from 'next';

import { DEFAULT_MIDDLEWARE_ROUTER_METHOD } from './constants';
import {
  AddMiddleware,
  InternalMiddlewareMap,
  MiddlewareRouterMethod,
  NextApiHandlerWithMiddleware,
  RouterMethod,
  TypedObject,
} from './type';

export abstract class ExpressLikeRouter {
  protected readonly middlewareParallelListMap: InternalMiddlewareMap = {};
  protected readonly middlewareQueueMap: InternalMiddlewareMap = {};

  protected readonly routeHandlerMap: Partial<
    Record<
      RouterMethod,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      NextApiHandlerWithMiddleware<unknown, any>
    >
  > = {};

  readonly use = this.addMiddleware(this.middlewareQueueMap);
  readonly inject = this.addMiddleware(this.middlewareParallelListMap);

  readonly get = this.addRouterMethod('GET');
  readonly head = this.addRouterMethod('HEAD');
  readonly patch = this.addRouterMethod('PATCH');
  readonly options = this.addRouterMethod('OPTIONS');
  readonly connect = this.addRouterMethod('CONNECT');
  readonly delete = this.addRouterMethod('DELETE');
  readonly trace = this.addRouterMethod('TRACE');
  readonly post = this.addRouterMethod('POST');
  readonly put = this.addRouterMethod('PUT');

  public abstract build(): NextApiHandler;

  private addMiddleware(middlewareMap: InternalMiddlewareMap) {
    return (<
      T extends TypedObject = TypedObject,
      M extends TypedObject = TypedObject
    >(
      methodOrHandler:
        | MiddlewareRouterMethod
        | NextApiHandlerWithMiddleware<T, M>,
      handler?: NextApiHandlerWithMiddleware<T, M>
    ): ExpressLikeRouter => {
      const isSingleParam = typeof methodOrHandler !== 'string';

      this.addOrSetPartialArrayMap(
        middlewareMap,
        isSingleParam ? DEFAULT_MIDDLEWARE_ROUTER_METHOD : methodOrHandler,
        isSingleParam ? methodOrHandler : handler
      );

      return this;
    }) as AddMiddleware<ExpressLikeRouter>;
  }

  private addOrSetPartialArrayMap<K extends string, V>(
    partialMap: Partial<Record<K, V[]>>,
    mapKey: K,
    mapValue: V
  ) {
    if (Array.isArray(partialMap[mapKey])) {
      partialMap[mapKey]!.push(mapValue);
    } else {
      partialMap[mapKey] = [mapValue];
    }
  }

  private addRouterMethod(method: RouterMethod) {
    return <T, M extends TypedObject = TypedObject>(
      handler: NextApiHandlerWithMiddleware<T, M>
    ): ExpressLikeRouter => {
      this.routeHandlerMap[method] = handler;
      return this;
    };
  }
}

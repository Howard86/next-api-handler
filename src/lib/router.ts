import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type RouterHandler<T = unknown> = (handler: ApiHandler<T>) => Router;

export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res?: NextApiResponse
) => T | Promise<T>;

export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;
export type SuccessApiResponse<T> = { success: true; data: T };
export type ErrorApiResponse = { success: false; message: string };

export default class Router {
  private readonly route: Record<string, ApiHandler> = {};

  get<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('GET', handler);
  }

  head<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('HEAD', handler);
  }

  patch<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('PATCH', handler);
  }

  options<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('OPTIONS', handler);
  }

  connect<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('CONNECT', handler);
  }

  delete<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('DELETE', handler);
  }

  trace<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('TRACE', handler);
  }

  post<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('POST', handler);
  }

  put<T = unknown>(handler: ApiHandler<T>): Router {
    return this.add('PUT', handler);
  }

  build(): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
      const handler = this.route[req.method || 'GET'];

      if (!handler) {
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`,
        });
      }

      try {
        const data = await handler(req, res);
        return res.status(200).json({
          success: true,
          data,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message:
            error instanceof Error ? error.message : 'Internal Server Error',
        });
      }
    };
  }

  private add<T = unknown>(method: string, handler: ApiHandler<T>): Router {
    this.route[method] = handler;
    return this;
  }
}

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type RouterHandler<T = unknown> = (handler: ApiHandler<T>) => Router;

export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res?: NextApiResponse
) => Promise<T>;

export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;
export type SuccessApiResponse<T> = { success: true; data: T };
export type ErrorApiResponse = { success: false; message: string };

export default class Router {
  private readonly route: Record<string, ApiHandler> = {};

  get: RouterHandler;
  head: RouterHandler;
  patch: RouterHandler;
  options: RouterHandler;
  connect: RouterHandler;
  delete: RouterHandler;
  trace: RouterHandler;
  post: RouterHandler;
  put: RouterHandler;

  constructor() {
    this.get = this.add.bind(this, 'GET');
    this.head = this.add.bind(this, 'HEAD');
    this.patch = this.add.bind(this, 'PATCH');
    this.options = this.add.bind(this, 'OPTIONS');
    this.connect = this.add.bind(this, 'CONNECT');
    this.delete = this.add.bind(this, 'DELETE');
    this.trace = this.add.bind(this, 'TRACE');
    this.post = this.add.bind(this, 'POST');
    this.put = this.add.bind(this, 'PUT');
  }

  private add<T = unknown>(method: string, handler: ApiHandler<T>): Router {
    this.route[method] = handler;
    return this;
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
}

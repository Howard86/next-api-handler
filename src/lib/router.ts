import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type RouterHandler<T = unknown> = (handler: NextApiHandler<T>) => Router;

export default class Router {
  private readonly route: Record<string, NextApiHandler> = {};

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

  private add<T = unknown>(method: string, handler: NextApiHandler<T>): Router {
    this.route[method] = handler;
    return this;
  }

  build(): NextApiHandler {
    return (req: NextApiRequest, res: NextApiResponse) => {
      const handler = this.route[req.method || 'GET'];

      if (!handler) {
        return res.status(405).send(`Method ${req.method} Not Allowed`);
      }

      return handler(req, res);
    };
  }
}

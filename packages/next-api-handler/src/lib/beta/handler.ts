import { NextRequest } from 'next/server';

import { HttpException } from '../http-exceptions';

export type MaybePromise<T> = T | Promise<T>;

export type HandlerParams<T> = (req: NextRequest) => MaybePromise<T>;

export const handler =
  <T>(params: HandlerParams<T>) =>
  async (req: NextRequest): Promise<Response> => {
    try {
      const data = await params(req);
      return Response.json({ success: true, data }, { status: 200 });
    } catch (error) {
      if (error instanceof HttpException) {
        return Response.json(
          {
            success: false,
            message:
              process.env.NODE_ENV === 'production'
                ? error.defaultMessage
                : error.message,
          },
          { status: error.status }
        );
      }

      console.error('Unexpected Error', error);
      return Response.json(
        {
          success: false,
          message: 'Internal Server Error',
        },
        { status: 500 }
      );
    }
  };

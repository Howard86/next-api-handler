import type { NextApiResponse } from 'next';

import { HttpException } from './http-exceptions';
import type { ErrorApiResponse, NextApiRequestWithMiddleware } from './router';

export type ApiErrorHandler = (
  req: NextApiRequestWithMiddleware,
  res: NextApiResponse<ErrorApiResponse>,
  error: Error
) => void;

export const errorHandler: ApiErrorHandler = (_req, res, error): void => {
  res.status(error instanceof HttpException ? error.status : 500).json({
    success: false,
    message: error.message,
  });
};

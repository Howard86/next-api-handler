import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpException } from './http-exceptions';
import type { ErrorApiResponse } from './router-builder';

export type ApiErrorHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ErrorApiResponse>,
  error: Error
) => void;

export const makeErrorHandler =
  (showMessage: boolean): ApiErrorHandler =>
  (_req, res, error): void => {
    if (error instanceof HttpException) {
      return res.status(error.status).json({
        success: false,
        message: showMessage ? error.message : error.defaultMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: showMessage ? error.message : 'Internal Server Error',
    });
  };

import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpException } from './http-exceptions';
import type { ErrorApiResponse } from './type';

/**
 * A function that handles API errors and sends an appropriate error response to the client.
 */
export type ApiErrorHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ErrorApiResponse>,
  error: Error
) => void;

/**
 * Creates an API error handler with the given `showMessage` flag.
 *
 * @param showMessage If true, the error message will be included in the error response.
 */
export const makeErrorHandler =
  (showMessage: boolean): ApiErrorHandler =>
  /**
   * Handles the given `error` and sends an appropriate error response to the client.
   */
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

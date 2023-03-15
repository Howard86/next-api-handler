import { testApiHandler } from 'next-test-api-route-handler';

import { RouterBuilder } from '../lib';
import { makeErrorHandler } from '../lib/error-handler';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  GoneException,
  HttpException,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  RequestTimeoutException,
  ServiceUnavailableException,
  TooManyRequestsException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '../lib/http-exceptions';
import { NextApiHandlerWithMiddleware } from '../lib/type';

describe('ErrorHandler', () => {
  const errorResponse: NextApiHandlerWithMiddleware = () => {
    throw new Error('TEST_ERROR');
  };

  const PREDEFINED_HTTP_EXCEPTIONS = [
    new BadRequestException('TEST_BAD_REQUEST'),
    new UnauthorizedException('TEST_UNAUTHORIZED'),
    new ForbiddenException('TEST_FORBIDDEN'),
    new NotFoundException('TEST_NOT_FOUND'),
    new MethodNotAllowedException('TEST_METHOD_NOT_ALLOWED'),
    new NotAcceptableException('TEST_NOT_ACCEPTABLE'),
    new RequestTimeoutException('TEST_REQUEST_TIMEOUT'),
    new ConflictException('TEST_CONFLICT'),
    new GoneException('TEST_GONE'),
    new PayloadTooLargeException('TEST_PAYLOAD_TOO_LARGE'),
    new UnsupportedMediaTypeException('TEST_UNSUPPORTED_MEDIA_TYPE'),
    new TooManyRequestsException('TEST_TOO_MANY_REQUESTS'),
    new InternalServerErrorException('TEST_INTERNAL_SERVER_ERROR'),
    new NotImplementedException('TEST_NOT_IMPLEMENTED'),
    new BadGatewayException('TEST_BAD_GATEWAY'),
    new ServiceUnavailableException('TEST_SERVICE_UNAVAILABLE'),
    new GatewayTimeoutException('TEST_GATEWAY_TIMEOUT'),
    new HttpException(),
  ];

  it('should accept non-http-exception error and return error message when showError is true', async () => {
    const handler = new RouterBuilder({ error: makeErrorHandler(true) })
      .get(errorResponse)
      .build();

    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({
          success: false,
          message: 'TEST_ERROR',
        });
      },
    });
  });

  it('should accept non-http-exception error and return default error message when showError is false', async () => {
    const handler = new RouterBuilder({ error: makeErrorHandler(false) })
      .get(errorResponse)
      .build();

    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({
          success: false,
          message: 'Internal Server Error',
        });
      },
    });
  });

  it('should accept http-exception error and return http error message when showError is true', async () => {
    await Promise.all(
      PREDEFINED_HTTP_EXCEPTIONS.map((exception) => {
        const handler = new RouterBuilder({ error: makeErrorHandler(true) })
          .get(() => {
            throw exception;
          })
          .build();

        return testApiHandler({
          handler,
          test: async ({ fetch }) => {
            const res = await fetch();

            expect(res.status).toBe(exception.status);
            expect(await res.json()).toEqual({
              success: false,
              message: exception.message,
            });
          },
        });
      })
    );
  });

  it('should accept http-exception error and return default http error message when showError is false', async () => {
    await Promise.all(
      PREDEFINED_HTTP_EXCEPTIONS.map((exception) => {
        const handler = new RouterBuilder({ error: makeErrorHandler(false) })
          .get(() => {
            throw exception;
          })
          .build();

        return testApiHandler({
          handler,
          test: async ({ fetch }) => {
            const res = await fetch();

            expect(res.status).toBe(exception.status);
            expect(await res.json()).toEqual({
              success: false,
              message: exception.defaultMessage,
            });
          },
        });
      })
    );
  });

  it('should accept custom http-exception error and return custom http error message when showError is true', async () => {
    const handler = new RouterBuilder({ error: makeErrorHandler(true) })
      .get(() => {
        throw new HttpException(418, 'TEST_CUSTOM_HTTP_EXCEPTION');
      })
      .build();

    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(res.status).toBe(418);
        expect(await res.json()).toEqual({
          success: false,
          message: 'TEST_CUSTOM_HTTP_EXCEPTION',
        });
      },
    });
  });

  it('should accept custom http-exception error and return default custom http error message when showError is false', async () => {
    const handler = new RouterBuilder({ error: makeErrorHandler(false) })
      .get(() => {
        throw new HttpException(418, 'TEST_CUSTOM_HTTP_EXCEPTION');
      })
      .build();

    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(res.status).toBe(418);
        expect(await res.json()).toEqual({
          success: false,
          message: 'Internal Server Error',
        });
      },
    });
  });
});

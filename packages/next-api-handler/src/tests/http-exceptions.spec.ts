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

describe('HttpException', () => {
  it('should contain correct status code', () => {
    const badRequest = new BadRequestException();
    expect(badRequest.status).toBe(400);
    expect(badRequest.defaultMessage).toBe('Bad Request');

    const unauthorized = new UnauthorizedException();
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.defaultMessage).toBe('Unauthorized');

    const forbidden = new ForbiddenException();
    expect(forbidden.status).toBe(403);
    expect(forbidden.defaultMessage).toBe('Forbidden');

    const notFound = new NotFoundException();
    expect(notFound.status).toBe(404);
    expect(notFound.defaultMessage).toBe('Not Found');

    const methodNotAllowed = new MethodNotAllowedException();
    expect(methodNotAllowed.status).toBe(405);
    expect(methodNotAllowed.defaultMessage).toBe('Method Not Allowed');

    const notAcceptable = new NotAcceptableException();
    expect(notAcceptable.status).toBe(406);
    expect(notAcceptable.defaultMessage).toBe('Not Acceptable');

    const requestTimeout = new RequestTimeoutException();
    expect(requestTimeout.status).toBe(408);
    expect(requestTimeout.defaultMessage).toBe('Request Timeout');

    const conflict = new ConflictException();
    expect(conflict.status).toBe(409);
    expect(conflict.defaultMessage).toBe('Conflict');

    const gone = new GoneException();
    expect(gone.status).toBe(410);
    expect(gone.defaultMessage).toBe('Gone');

    const payloadTooLarge = new PayloadTooLargeException();
    expect(payloadTooLarge.status).toBe(413);
    expect(payloadTooLarge.defaultMessage).toBe('Payload Too Large');

    const unsupportedMediaType = new UnsupportedMediaTypeException();
    expect(unsupportedMediaType.status).toBe(415);
    expect(unsupportedMediaType.defaultMessage).toBe('Unsupported Media Type');

    const tooManyRequests = new TooManyRequestsException();
    expect(tooManyRequests.status).toBe(429);
    expect(tooManyRequests.defaultMessage).toBe('Too Many Requests');

    const internalServerError = new InternalServerErrorException();
    expect(internalServerError.status).toBe(500);
    expect(internalServerError.defaultMessage).toBe('Internal Server Error');

    const notImplemented = new NotImplementedException();
    expect(notImplemented.status).toBe(501);
    expect(notImplemented.defaultMessage).toBe('Not Implemented');

    const badGateway = new BadGatewayException();
    expect(badGateway.status).toBe(502);
    expect(badGateway.defaultMessage).toBe('Bad Gateway');

    const serviceUnavailable = new ServiceUnavailableException();
    expect(serviceUnavailable.status).toBe(503);
    expect(serviceUnavailable.defaultMessage).toBe('Service Unavailable');

    const gatewayTimeout = new GatewayTimeoutException();
    expect(gatewayTimeout.status).toBe(504);
    expect(gatewayTimeout.defaultMessage).toBe('Gateway Timeout');

    const httpException = new HttpException(500);
    expect(httpException.status).toBe(500);
    expect(httpException.defaultMessage).toBe('Internal Server Error');
  });
});

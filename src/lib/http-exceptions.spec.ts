import test from 'ava';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  PayloadTooLargeException,
  RequestTimeoutException,
  TooManyRequestsException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from './http-exceptions';

test('should contain correct status code', (t) => {
  const error400: HttpException = t.throws(() => {
    throw new BadRequestException();
  });

  t.is(error400.status, 400);

  const error401: HttpException = t.throws(() => {
    throw new UnauthorizedException();
  });

  t.is(error401.status, 401);

  const error403: HttpException = t.throws(() => {
    throw new ForbiddenException();
  });

  t.is(error403.status, 403);

  const error404: HttpException = t.throws(() => {
    throw new NotFoundException();
  });

  t.is(error404.status, 404);

  const error405: HttpException = t.throws(() => {
    throw new MethodNotAllowedException();
  });

  t.is(error405.status, 405);

  const error406: HttpException = t.throws(() => {
    throw new NotAcceptableException();
  });

  t.is(error406.status, 406);

  const error408: HttpException = t.throws(() => {
    throw new RequestTimeoutException();
  });

  t.is(error408.status, 408);

  const error409: HttpException = t.throws(() => {
    throw new ConflictException();
  });

  t.is(error409.status, 409);

  const error410: HttpException = t.throws(() => {
    throw new GoneException();
  });

  t.is(error410.status, 410);

  const error413: HttpException = t.throws(() => {
    throw new PayloadTooLargeException();
  });

  t.is(error413.status, 413);

  const error415: HttpException = t.throws(() => {
    throw new UnsupportedMediaTypeException();
  });

  t.is(error415.status, 415);

  const error428: HttpException = t.throws(() => {
    throw new TooManyRequestsException();
  });

  t.is(error428.status, 428);
});

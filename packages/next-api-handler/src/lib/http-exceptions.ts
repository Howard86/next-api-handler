export class HttpException extends Error {
  status: number;
  defaultMessage: string;

  constructor(
    status = 500,
    message?: string,
    defaultMessage = 'Internal Server Error'
  ) {
    super(message || defaultMessage);
    this.status = status;
    this.defaultMessage = defaultMessage;
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string, defaultMessage = 'Bad Request') {
    super(400, message, defaultMessage);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string, defaultMessage = 'Unauthorized') {
    super(401, message, defaultMessage);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string, defaultMessage = 'Forbidden') {
    super(403, message, defaultMessage);
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string, defaultMessage = 'Not Found') {
    super(404, message, defaultMessage);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message?: string, defaultMessage = 'Method Not Allowed') {
    super(405, message, defaultMessage);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message?: string, defaultMessage = 'Not Acceptable') {
    super(406, message, defaultMessage);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message?: string, defaultMessage = 'Request Timeout') {
    super(408, message, defaultMessage);
  }
}

export class ConflictException extends HttpException {
  constructor(message?: string, defaultMessage = 'Conflict') {
    super(409, message, defaultMessage);
  }
}

export class GoneException extends HttpException {
  constructor(message?: string, defaultMessage = 'Gone') {
    super(410, message, defaultMessage);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message?: string, defaultMessage = 'Payload Too Large') {
    super(413, message, defaultMessage);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message?: string, defaultMessage = 'Unsupported Media Type') {
    super(415, message, defaultMessage);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message?: string, defaultMessage = 'Too Many Requests') {
    super(429, message, defaultMessage);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message?: string, defaultMessage = 'Internal Server Error') {
    super(500, message, defaultMessage);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message?: string, defaultMessage = 'Not Implemented') {
    super(501, message, defaultMessage);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message?: string, defaultMessage = 'Bad Gateway') {
    super(502, message, defaultMessage);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message?: string, defaultMessage = 'Service Unavailable') {
    super(503, message, defaultMessage);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message?: string, defaultMessage = 'Gateway Timeout') {
    super(504, message, defaultMessage);
  }
}

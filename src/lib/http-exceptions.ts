export class HttpException extends Error {
  status: number;
  defaultMessage: string;

  constructor(
    status: number,
    message: string,
    defaultMessage = 'Internal Server Error'
  ) {
    super(message);
    this.status = status;
    this.defaultMessage = defaultMessage;
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string, defaultMessage = 'Bad Request') {
    super(400, message || defaultMessage, defaultMessage);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string, defaultMessage = 'Unauthorized') {
    super(401, message || defaultMessage, defaultMessage);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string, defaultMessage = 'Forbidden') {
    super(403, message || defaultMessage, defaultMessage);
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string, defaultMessage = 'Not Found') {
    super(404, message || defaultMessage, defaultMessage);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message?: string, defaultMessage = 'Method Not Allowed') {
    super(405, message || defaultMessage, defaultMessage);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message?: string, defaultMessage = 'Not Acceptable') {
    super(406, message || defaultMessage, defaultMessage);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message?: string, defaultMessage = 'Request Timeout') {
    super(408, message || defaultMessage, defaultMessage);
  }
}

export class ConflictException extends HttpException {
  constructor(message?: string, defaultMessage = 'Conflict') {
    super(409, message || defaultMessage, defaultMessage);
  }
}

export class GoneException extends HttpException {
  constructor(message?: string, defaultMessage = 'Gone') {
    super(410, message || defaultMessage, defaultMessage);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message?: string, defaultMessage = 'Payload Too Large') {
    super(413, message || defaultMessage, defaultMessage);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message?: string, defaultMessage = 'Unsupported Media Type') {
    super(415, message || defaultMessage, defaultMessage);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message?: string, defaultMessage = 'Too Many Requests') {
    super(428, message || defaultMessage, defaultMessage);
  }
}

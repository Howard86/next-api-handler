export class HttpException extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message = 'Method Not Allowed') {
    super(405, message);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message = 'Not Acceptable') {
    super(406, message);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message = 'Request Timeout') {
    super(408, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class GoneException extends HttpException {
  constructor(message = 'Gone') {
    super(410, message);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message = 'Payload Too Large') {
    super(413, message);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message = 'Unsupported Media Type') {
    super(415, message);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message = 'Too Many Requests') {
    super(428, message);
  }
}

/**
 * An exception that represents an HTTP error response.
 */
export class HttpException extends Error {
  /** The status code of the HTTP response. */
  status: number;
  /** The default message of the HTTP response. */
  defaultMessage: string;

  /**
   * Create a new HttpException instance.
   * @param status The status code of the HTTP response. Defaults to 500.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Internal Server Error'.
   */
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

/**
 * An exception that represents a 400 Bad Request HTTP error response.
 */
export class BadRequestException extends HttpException {
  /**
   * Create a new BadRequestException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Bad Request'.
   */
  constructor(message?: string, defaultMessage = 'Bad Request') {
    super(400, message, defaultMessage);
  }
}

/**
 * An exception that represents a 401 Unauthorized HTTP error response.
 */
export class UnauthorizedException extends HttpException {
  /**
   * Create a new UnauthorizedException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Unauthorized'.
   */
  constructor(message?: string, defaultMessage = 'Unauthorized') {
    super(401, message, defaultMessage);
  }
}

/**
 * An exception that represents a 403 Forbidden HTTP error response.
 */
export class ForbiddenException extends HttpException {
  /**
   * Create a new ForbiddenException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Forbidden'.
   */
  constructor(message?: string, defaultMessage = 'Forbidden') {
    super(403, message, defaultMessage);
  }
}

/**
 * An exception that represents a 404 Not Found HTTP error response.
 */
export class NotFoundException extends HttpException {
  /**
   * Create a new NotFoundException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Not Found'.
   */
  constructor(message?: string, defaultMessage = 'Not Found') {
    super(404, message, defaultMessage);
  }
}

/**
 * An exception that represents a 405 Method Not Allowed HTTP error response.
 */
export class MethodNotAllowedException extends HttpException {
  /**
   * Create a new MethodNotAllowedException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Method Not Allowed'.
   */
  constructor(message?: string, defaultMessage = 'Method Not Allowed') {
    super(405, message, defaultMessage);
  }
}

/**
 * An exception that represents a 406 Not Acceptable HTTP error response.
 */
export class NotAcceptableException extends HttpException {
  /**
   * Create a new NotAcceptableException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Not Acceptable'.
   */
  constructor(message?: string, defaultMessage = 'Not Acceptable') {
    super(406, message, defaultMessage);
  }
}

/**
 * An exception that represents a 408 Request Timeout HTTP error response.
 */
export class RequestTimeoutException extends HttpException {
  /**
   * Create a new RequestTimeoutException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Request Timeout'.
   */
  constructor(message?: string, defaultMessage = 'Request Timeout') {
    super(408, message, defaultMessage);
  }
}

/**
 * An exception that represents a 409 Conflict HTTP error response.
 */
export class ConflictException extends HttpException {
  /**
   * Create a new ConflictException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Conflict'.
   */
  constructor(message?: string, defaultMessage = 'Conflict') {
    super(409, message, defaultMessage);
  }
}

/**
 * An exception that represents a 410 Gone HTTP error response.
 */
export class GoneException extends HttpException {
  /**
   * Create a new GoneException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Gone'.
   */
  constructor(message?: string, defaultMessage = 'Gone') {
    super(410, message, defaultMessage);
  }
}

/**
 * An exception that represents a 413 Payload Too Large HTTP error response.
 */
export class PayloadTooLargeException extends HttpException {
  /**
   * Create a new PayloadTooLargeException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Payload Too Large'.
   */
  constructor(message?: string, defaultMessage = 'Payload Too Large') {
    super(413, message, defaultMessage);
  }
}

/**
 * An exception that represents a 415 Unsupported Media Type HTTP error response.
 */
export class UnsupportedMediaTypeException extends HttpException {
  /**
   * Create a new UnsupportedMediaTypeException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Unsupported Media Type'.
   */
  constructor(message?: string, defaultMessage = 'Unsupported Media Type') {
    super(415, message, defaultMessage);
  }
}

/**
 * An exception that represents a 429 Too Many Requests HTTP error response.
 */
export class TooManyRequestsException extends HttpException {
  /**
   * Create a new TooManyRequestsException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Too Many Requests'.
   */
  constructor(message?: string, defaultMessage = 'Too Many Requests') {
    super(429, message, defaultMessage);
  }
}

/**
 * An exception that represents a 500 Internal Server Error HTTP error response.
 */
export class InternalServerErrorException extends HttpException {
  /**
   * Create a new InternalServerErrorException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Internal Server Error'.
   */
  constructor(message?: string, defaultMessage = 'Internal Server Error') {
    super(500, message, defaultMessage);
  }
}

/**
 * An exception that represents a 501 Not Implemented HTTP error response.
 */
export class NotImplementedException extends HttpException {
  /**
   * Create a new NotImplementedException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Not Implemented'.
   */
  constructor(message?: string, defaultMessage = 'Not Implemented') {
    super(501, message, defaultMessage);
  }
}

/**
 * An exception that represents a 502 Bad Gateway HTTP error response.
 */
export class BadGatewayException extends HttpException {
  /**
   * Create a new BadGatewayException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Bad Gateway'.
   */
  constructor(message?: string, defaultMessage = 'Bad Gateway') {
    super(502, message, defaultMessage);
  }
}

/**
 * An exception that represents a 503 Service Unavailable HTTP error response.
 */
export class ServiceUnavailableException extends HttpException {
  /**
   * Create a new ServiceUnavailableException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Service Unavailable'.
   */
  constructor(message?: string, defaultMessage = 'Service Unavailable') {
    super(503, message, defaultMessage);
  }
}

/**
 * An exception that represents a 504 Gateway Timeout HTTP error response.
 */
export class GatewayTimeoutException extends HttpException {
  /**
   * Create a new GatewayTimeoutException instance.
   * @param message The message of the HTTP response.
   * @param defaultMessage The default message of the HTTP response. Defaults to 'Gateway Timeout'.
   */
  constructor(message?: string, defaultMessage = 'Gateway Timeout') {
    super(504, message, defaultMessage);
  }
}

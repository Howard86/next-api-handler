export interface ApiLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

type LogFunction = (message?: string) => void;

enum LoggerLevelMap {
  debug,
  info,
  warn,
  error,
}

export type LoggerLevel = keyof typeof LoggerLevelMap;

const DEFAULT_LOGGER_LEVEL: LoggerLevel =
  process.env.NODE_ENV === 'development' ? 'info' : 'error';
const DEFAULT_CONTEXT = '[next-api-handler]';

export interface DefaultApiLoggerOption {
  context?: string;
  loggerLevel?: LoggerLevel;
}

export class DefaultApiLogger implements ApiLogger {
  private readonly context: string;
  private readonly level: number;
  private readonly DEFAULT_MESSAGE = '';

  constructor({
    context = DEFAULT_CONTEXT,
    loggerLevel = DEFAULT_LOGGER_LEVEL,
  }: DefaultApiLoggerOption = {}) {
    this.context = context;
    this.level = LoggerLevelMap[loggerLevel];
  }

  debug = this.logMessage('debug');
  info = this.logMessage('info');
  warn = this.logMessage('warn');
  error = this.logMessage('error');

  private logMessage(level: LoggerLevel) {
    if (this.level > LoggerLevelMap[level]) return this.emptyFunction;

    return (message = this.DEFAULT_MESSAGE) => {
      console[level](
        `${this.context} ${level} ${new Date().toISOString()} ${message}`
      );
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private emptyFunction(_message?: string) {}
}

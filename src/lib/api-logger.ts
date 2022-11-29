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
  silent,
}

export type LoggerLevel = keyof typeof LoggerLevelMap;

const DEFAULT_CONTEXT = '[next-api-handler]';

export interface DefaultApiLoggerOption {
  context?: string;
  loggerLevel?: LoggerLevel;
}

export class DefaultApiLogger implements ApiLogger {
  private readonly context: string;
  private readonly level: LoggerLevel;

  constructor(option: DefaultApiLoggerOption = {}) {
    this.context = option.context || DEFAULT_CONTEXT;
    this.level = option.loggerLevel || this.defaultLoggerLevel;
  }

  debug = this.logMessage('debug');
  info = this.logMessage('info');
  warn = this.logMessage('warn');
  error = this.logMessage('error');

  private get defaultLoggerLevel(): LoggerLevel {
    return process.env.NODE_ENV === 'test'
      ? 'silent'
      : process.env.NODE_ENV === 'development'
      ? 'info'
      : 'error';
  }

  private logMessage(level: Exclude<LoggerLevel, 'silent'>) {
    return (message?: string) => {
      if (LoggerLevelMap[this.level] <= LoggerLevelMap[level]) {
        console[level](
          `${this.context} ${level} ${new Date().toISOString()} ${message}`
        );
      }
    };
  }
}

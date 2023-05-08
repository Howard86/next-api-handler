/**
 * The different logger levels available.
 */
enum LoggerLevelMap {
  debug,
  info,
  warn,
  error,
  silent,
}

/**
 * A type representing a logger level.
 */
export type LoggerLevel = keyof typeof LoggerLevelMap;

/**
 * An interface defining the methods available on a logger.
 */
export interface ApiLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

/**
 * A type defining a log function.
 */
type LogFunction = (message?: string) => void;

/**
 * Options that can be passed to a DefaultApiLogger instance.
 */
export interface DefaultApiLoggerOption {
  /**
   * The logger context.
   */
  context?: string;
  /**
   * The logger level.
   */
  loggerLevel?: LoggerLevel;
}

/**
 * The default logger context.
 */
const DEFAULT_CONTEXT = '[next-api-handler]';

/**
 * A logger that logs messages to the console.
 */
export class DefaultApiLogger implements ApiLogger {
  private readonly context: string;
  private readonly level: LoggerLevel;

  /**
   * Creates a new instance of DefaultApiLogger.
   * @param option The options to use when creating the logger.
   */
  constructor(option: DefaultApiLoggerOption = {}) {
    /**
     * The logger context.
     */
    this.context = option.context || DEFAULT_CONTEXT;

    /**
     * The logger level.
     */
    this.level = option.loggerLevel || this.defaultLoggerLevel;
  }

  /**
   * Logs a debug message.
   * @param message The message to log.
   */
  debug = this.logMessage('debug');

  /**
   * Logs an info message.
   * @param message The message to log.
   */
  info = this.logMessage('info');

  /**
   * Logs a warning message.
   * @param message The message to log.
   */
  warn = this.logMessage('warn');

  /**
   * Logs an error message.
   * @param message The message to log.
   */
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

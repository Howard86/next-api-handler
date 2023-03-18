---
title: RouterBuilderOption
description: An object passed to class RouterBuilder constructor for further configuration
---

An object passed to class RouterBuilder constructor for further configuration

---

We can initialize a new router builder by calling the `RouterBuilder` class constructor with following options.

```ts
const router = new RouterBuilder(options: RouterBuilderOptions);

export type RouterBuilderOptions = Partial<{
  error: ApiErrorHandler;
  showMessage: boolean;
  logger: ApiLogger;
  loggerOption: DefaultApiLoggerOption;
}>;
```

---

## ApiErrorHandler

A function that accepts `NextApiRequest`, `NextApiResponse` and `Error` as parameters fulfilling the `ApiErrorHandler` type.

```ts
export type ApiErrorHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ErrorApiResponse>,
  error: Error
) => void;
```

Please refer to [Custom exception handler](/docs/restful-api#custom-exception-handler) section for more details.

## showMessage

A boolean indicates whether to show the message in the response body for default error handler.

Please refer to [Custom exception handler](/docs/restful-api#custom-exception-handler) section for more details.

---

## ApiLogger

A function fulfilling the `ApiLogger` interface.

```ts
export interface ApiLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

export type LogFunction = (message?: string) => void;
```

Please refer to [Logger Interface](/docs/logger-for-debugging#logger-interface) section for more details.

## loggerOption

An object that contains options for the default logger.

```ts
export interface DefaultApiLoggerOption {
  context?: string;
  loggerLevel?: LoggerLevel;
}

export type LoggerLevel = keyof typeof LoggerLevelMap;

enum LoggerLevelMap {
  debug,
  info,
  warn,
  error,
  silent,
}
```

Please refer to [Logger Options](/docs/logger-for-debugging#logger-options) section for more details.

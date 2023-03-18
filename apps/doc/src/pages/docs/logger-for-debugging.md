---
title: Logger for debugging
description: next-api-handler provides a logger interface that accepts any existed logger, also with a default logger that can be used to log messages to the console.
---

[next-api-handler](https://www.npmjs.com/package/next-api-handler) provides a logger interface that accepts any existed logger, also with a default logger that can be used to log messages to the console.

---

## Logger Interface

[next-api-handler](https://www.npmjs.com/package/next-api-handler) can accept any logger solution (e.g. [pino](https://getpino.io/#/)) that implements the following interface:

```ts
interface ApiLogger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

type LogFunction = (message?: string) => void;
```

To use a logger, you can pass it to the `RouterBuilder` constructor:

```js
import { RouterBuilder } from 'next-api-handler';
import { logger } from '@/server/logger';

const router = new RouterBuilder({
  logger: myLogger,
});
```

---

## Default Logger

[next-api-handler](https://www.npmjs.com/package/next-api-handler) also provides a default logger that can be used to log messages to the console, which will be used if no logger is passed to the `RouterBuilder` constructor.

When running locally in development mode, you may see messages similar to the following on console:

```bash
[next-api-handler] error 2022-11-29T14:15:30.828Z Caught errors from GET /api/after/simple with 0ms
[next-api-handler] info 2022-11-29T14:16:59.306Z Successfully handled GET /api/after/simple?id=123 with 0ms
```

### Logger Options

This behavior could be amended by updating logger option

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder({
  loggerOptions: {
    context: 'my-context',
    level: 'info',
  },
});
```

where `context` is the context of the logger shown in console, and `level` is the log level.

`level` satisfies type `LoggerLevel` and has available ordered options `silent`, `debug`, `info`, `warn`, `error` such that

- if `level` is `silent`, no logs will be triggered
- otherwise only the methods itself & after will be triggered e.g. when `level="warn"`, only `logger.warn` & `logger.error` will show on the console

### Default Logger Options

By default, `level` is pre-configured based on different Node running environments

```bash
# when running in development i.e. NODE_ENV=development
level="info"

# when running in production i.e. NODE_ENV=production
level="error"

# when running tests i.e. NODE_ENV=test
level="silent"
```

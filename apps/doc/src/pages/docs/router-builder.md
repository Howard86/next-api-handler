---
title: RouterBuilder
description: A router builder is a class following builder pattern that exposes express-like api.
---

A router builder is a class following builder pattern that exposes express-like api.

---

## constructor

A function that accepts an object of type `RouterBuilderOptions` as parameter.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder(options);

export default router.build();
```

Please refer to [RouterBuilderOption](/docs/router-builder-option) section for more details.

## build()

A function that returns a `NextApiHandler` function, to be experted as default export of a Next.js API route.

```js
// pages/api/hello.js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get((req, res) => 'Hello World');

export default router.build();
```

## HTTP methods

### get()

a function that accepts a `NextApiHandler` function as parameter, to be triggered when HTTP GET method is called.

### post()

a function that accepts a `NextApiHandler` function as parameter, to be triggered when HTTP POST method is called.

### put()

a function that accepts a `NextApiHandler` function as parameter, to be triggered when HTTP PUT method is called.

### patch()

a function that accepts a `NextApiHandler` function as parameter, to be triggered when HTTP PATCH method is called.

### delete()

a function that accepts a `NextApiHandler` function as parameter, to be triggered when HTTP DELETE method is called.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router
  .get((req, res) => 'Trigger HTTP GET method')
  .post((req, res) => 'Trigger HTTP POST method')
  .put((req, res) => 'Trigger HTTP PUT method')
  .patch((req, res) => 'Trigger HTTP PATCH method')
  .delete((req, res) => 'Trigger HTTP DELETE method'));

export default router.build();
```

Please refer to [CRUD Example](/docs/restful-api#crud-example) section for more details.

---

## Middleware functions

### use()

A function that accepts `NextApiRequest` and `NextApiResponse` as parameters and returns an (asynchronous) result that will be used as a middleware and will be executed _sequentially_ before the handler.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router
  .use((req, res) => ({ message: 'Hello' }))
  .use((req, res) => ({ message: `${req.middleware.message} World` }))
  .get((req, res) => req.middleware.message);

export default router.build();
```

Please refer to [Sequential Execution](/docs/api-middleware#sequential-execution) section for more details.

### inject()

A function that accepts `NextApiRequest` and `NextApiResponse` as parameters and returns an (asynchronous) result that will be used as a middleware and will be executed _in parallel_ before the handler.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router
  .inject((req, res) => ({ messageStart: 'Hello' }))
  .inject((req, res) => ({ messageEnd: 'World' }))
  .get(
    (req, res) => `${req.middleware.messageStart} ${req.middleware.messageEnd}`
  );

export default router.build();
```

Please refer to [Parallel Execution](/docs/api-middleware#parallel-execution) section for more details.

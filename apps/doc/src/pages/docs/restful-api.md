---
title: RESTful API
description: This doc will show you how to set up a RESTful API with next-api-handler with CRUD example.
---

This doc will show you how to set up a RESTful API with [next-api-handler](https://www.npmjs.com/package/next-api-handler) with CRUD example.

---

## CRUD example

Imagine you have a `User` service that provides CRUD operations for users. [next-api-handler](https://www.npmjs.com/package/next-api-handler) can accept an async function as the handler, so you can use `async/await` to handle the request.

```js
import { RouterBuilder } from 'next-api-handler';
import { createUser } from '@/services/user';

const router = new RouterBuilder();

router
  .get(() => [{ id: 1, name: 'John Doe' }])
  .post(async (req) => createUser(req.body));

export default router.build();
```

Which is equivalent to the following code and return the same `json` response.

```js
import { createUser } from '@/services/user';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await createUser(req.body);
    res.status(200).json({ success: true, data: user });
  } else if (req.method === 'GET') {
    res.status(200).json({ success: true, data: [{ name: 'John Doe' }] });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
```

## Type safety

If you are using `TypeScript`, we can also enforce the response type by using generics.

```ts
import { RouterBuilder } from 'next-api-handler';
import { createUser } from '@/services/user';

type User = {
  id: number;
  name: string;
};

const router = new RouterBuilder();

router
  .get<User[]>(() => [{ id: 1, name: 'John Doe' }])
  .post<User>(async (req) => createUser(req.body));

export default router.build();
```

The following will show `TypeScript` error.

```ts
/**
 *  Argument of type '() => { id: number; }' is not assignable to parameter of type 'NextApiHandlerWithMiddleware<User, TypedObject>'.
 *  Type '{ id: number; }' is not assignable to type 'void | User | Promise<User>'.
 *    Property 'name' is missing in type '{ id: number; }' but required in type 'User'.ts(2345)
 *  user.ts(3, 3): 'name' is declared here.
 * */
router.put<User>(() => ({ id: 1 }));
```

---

## HTTP exceptions and error handling

[next-api-handler](https://www.npmjs.com/package/next-api-handler) provides a set of HTTP exceptions that can be used to throw errors in the handler function. The error will be caught by [next-api-handler](https://www.npmjs.com/package/next-api-handler) and return a `json` response with the status code and message.

### Built-in exceptions

```js
import { RouterBuilder, BadRequestException } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => {
  throw new BadRequestException('Something went wrong');
});

export default router.build();
```

Which is equivalent to the following code and return the same `json` response.

```js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(400).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Bad Request'
          : 'something went wrong ',
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
```

Please refer to the [API reference](/docs/api-reference) for more detailed configuration of the router.

### Custom exceptions

You can also create your own exceptions by extending or using the `HttpException` class.

```js
import { RouterBuilder, HttpException } from 'next-api-handler';

class CustomException extends HttpException {
  constructor(message) {
    super(400, message);
  }
}

const router = new RouterBuilder();

router.get(() => {
  throw new CustomException('Something went wrong');
});

export default router.build();
```

The following will return the same `json` response.

```js
import { RouterBuilder, HttpException } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => {
  throw new HttpException(400, 'Something went wrong');
});

export default router.build();
```

### Uncaught exceptions

If an non-`HttpException` is caught by [next-api-handler](https://www.npmjs.com/package/next-api-handler), it will be handled by the default error handler. The default error handler will return a `json` response with the status code `500` and the error message.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => {
  throw new Error('Something went wrong');
});

export default router.build();
```

which is equivalent to the following code and return the same `json` response.

```js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : 'Something went wrong',
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
```

This also applies to rejected promises.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => {
  return Promise.reject('Something went wrong');
});

export default router.build();
```

### Custom exception handler

You can also create your own exception handler by creating a function that accepts `NextApiRequest`, `NextApiResponse` and `Error` as parameters fulfilling the `ApiErrorHandler` type.

```ts
export type ApiErrorHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ErrorApiResponse>,
  error: Error
) => void;
```

Then pass the function to the `RouterBuilder` constructor.

```js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder({
  error: (req, res, error) => {
    // Your custom error handler, remember adding res.json() to return the response
  },
});

export default router.build();
```

The following will generate the default error handler based on RouterBuilder constructor options. `showMessage` field.

By default, `showMessage` is set to `false` for production environment and `true` otherwise.

```ts
export const makeErrorHandler =
  (showMessage: boolean): ApiErrorHandler =>
  (_req, res, error): void => {
    if (error instanceof HttpException) {
      return res.status(error.status).json({
        success: false,
        message: showMessage ? error.message : error.defaultMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: showMessage ? error.message : 'Internal Server Error',
    });
  };
```

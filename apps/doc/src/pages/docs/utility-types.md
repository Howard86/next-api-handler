---
title: Utility Types
description: A collection of utility types that can be used to build custom types.
---

A collection of utility types that can be used to build custom types.

---

## NextApiHandlerWithMiddleware

This is a standard next.js api handler following `NextApiHandler` but with `req.middleware` available.

This type is used to define a `NextApiHandler` function with middleware, which is also the shared type for api handler or using API middleware.

```ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type TypedObject<T = unknown> = Record<string, T>;

export type NextApiHandlerWithMiddleware<
  T = unknown,
  M extends TypedObject = TypedObject,
> = (
  req: NextApiRequestWithMiddleware<M>,
  res: NextApiResponse
) => T | Promise<T> | void;

export interface NextApiRequestWithMiddleware<
  M extends TypedObject = TypedObject,
> extends NextApiRequest {
  middleware: M;
}
```

For example, defining a GET handler

```ts
import { NextApiHandlerWithMiddleware } from 'next-api-handler';

const handler: NextApiHandlerWithMiddleware<User, UserMiddleware> = (
  req,
  res
) => {
  // `req.middleware` is available here
  return req.middleware.user;
};
```

Please refer to [Type Safety](/docs/restful-api#type-safety) section for more details.

## ApiResponse

This is a type that represents the response of an API call.

```ts
export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;

export type SuccessApiResponse<T> = { success: true; data: T };

export type ErrorApiResponse = { success: false; message: string };
```

We can utilize this type to define a type safety API call from client side.

### With `fetch`

For example, using with `fetch`:

```ts
import { ApiResponse } from 'next-api-handler';

export const getUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  const result = (await res.json()) as ApiResponse<User[]>;

  if (!result.success) throw new Error(result.message);

  return result.data;
};
```

### With `axios`

```ts
import axios from 'axios';
import { ApiResponse, SuccessApiResponse } from 'next-api-handler';

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<SuccessApiResponse<User[]>>('/api/users');

  return response.data.data;
};
```

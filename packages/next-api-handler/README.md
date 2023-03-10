# next-api-handler

[![install size](https://packagephobia.com/badge?p=next-api-handler)](https://packagephobia.com/result?p=next-api-handler)
[![CircleCI](https://circleci.com/gh/Howard86/next-api-handler/tree/main.svg?style=svg)](https://circleci.com/gh/Howard86/next-api-handler/tree/main)
[![codecov](https://codecov.io/gh/Howard86/next-api-handler/branch/main/graph/badge.svg?token=EIH9QQTLXT)](https://codecov.io/gh/Howard86/next-api-handler)
[![next-api-handler](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/d5185e/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/d5185e/runs)
![Known Vulnerabilities](https://snyk.io/test/github/howard86/next-api-handler/badge.svg)

lightweight next.js api handler wrapper, portable & configurable for serverless environment

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
- [Features](#features)
  - [Basic Usage](#basic-usage)
  - [More CRUD](#more-crud)
  - [Handling HTTP Error Response](#handling-http-error-response)
  - [API Middleware](#api-middleware)
  - [API Logger](#api-logger)
- [Utilities](#utilities)
  - [Type declaration & Type-checking](#type-declaration---type-checking)
- [Compatibility](#compatibility)
- [Reference](#reference)
- [License](#license)

## Introduction

[next-api-handler](https://www.npmjs.com/package/next-api-handler) contains helper functions and generic types to create next.js [API routes](https://nextjs.org/docs/api-routes/introduction) with strong type declaration and type-checking.

[next-api-handler](https://www.npmjs.com/package/next-api-handler) will help in the following 3 aspects

- sharable & express-like apis with middleware to build RESTful api route
- simple response handler to transform response and error/exception in a predictable way
- friendly generic types to build type-safe API interface shared between client & server

## Getting Started

**TL;DR**

The following snippet will create `/api/user` following RESTful standard

```ts
// in new /pages/api/user.ts
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.post(async (req) => createUser(req.query.id));
router.get<{ name: string }>(() => ({ name: 'John Doe' }));

export default router.build();
```

### Requirements

Currently only tested with `node.js v14+` with `next.js v10+`

> Feel free to submit if you have issues regard to runtime environments

### Installation

```sh
npm install next-api-handler
# or using yarn
yarn add next-api-handler
```

## Features

### Basic Usage

We can use `express.js` router-like builder

```js
// in new /pages/api/user.js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.post((req) => createUser(req.query.id));
router.get(() => ({ name: 'John Doe' }));

// or with async/await
// router.post(async (req) => {
//   const user = await createUser(req.query.id);
//   return user;
// });

export default router.build();
```

Which is equivalent to the following next.js [API routes](https://nextjs.org/docs/api-routes/introduction)

```js
// in old /pages/api/user.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await createUser(req.query.id); // some async function/services
    res.status(200).json({ success: true, data: user });
  } else if (req.method === 'GET') {
    res.status(200).json({ success: true, data: { name: 'John Doe' } });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
```

Please see more examples in [example](/example/pages/api) folder, can compare `/pages/api/before/*` & `/pages/api/after/*`

### More CRUD

Please see examples in [before/crud/[id].ts](/example/pages/api/before/crud/[id].ts) and [after/crud/[id].ts](/example/pages/api/after/crud/[id].ts)

### Handling HTTP Error Response

There are some common built-in HTTP exceptions to shorten writing up error response, this can get particularly useful when writing up complex controllers

```js
import { RouterBuilder, BadRequestException } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => throw new BadRequestException('something went wrong'));

export default router.build();
```

is equivalent to do

```js
export default function handler(_req, res) {
  return res.status(400).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Bad Request'
        : 'something went wrong ',
  });
}
```

We can disable `process.env.NODE_ENV` check by passing `showMessage=true` when creating the router

```js
const router = new RouterBuilder({ showMessage: true });
```

### API Middleware

If there's a piece of shared logic _before_ handling the request, we can create middleware with typescript support

```ts
import { UnauthorizedException, NotFoundException } from 'next-api-handler';
import type { NextApiRequest, NextApiResponse } from 'next';

const authMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiKey = req.cookies['Authorization'];

  const isValid = await verify(apiKey); // some async service to check apiKey

  if (!isValid) {
    throw new UnauthorizedException();
  }

  const user = await getUserInfo(apiKey); // another async service to fetch user

  if (!user) {
    throw new NotFoundException();
  }

  return { user };
};
```

then we can reuse this `user` value in all other routes white enforcing type-checking

```ts
import { RouterBuilder, NextApiRequestWithMiddleware } from 'next-api-handler';

// some type returned from getUserInfo
type User = {
  id: string;
};

const router = new RouterBuilder();

// or router.inject(authMiddleware) if the order of adding middleware does not matter
router.use<User>(authMiddleware);

// all middleware values will stay in `req.middleware`,
router.get<string, User>(
  (req: NextApiRequestWithMiddleware<User>) => req.middleware.user.id
);

export default router.build();
```

### API Logger

By default, `next-api-handler` will set up a simple console logger to track api calls for debugging purpose.

e.g. When running `yarn dev` and triggering some api calls, we shall see something like the following

```sh
[next-api-handler] error 2022-11-29T14:15:30.828Z Caught errors from GET /api/after/simple with 0ms
[next-api-handler] info 2022-11-29T14:16:59.306Z Successfully handled GET /api/after/simple?id=123 with 0ms
```

This is the default api logger when `NODE_ENV=development` with following default `loggerOption`

```json
{
  "context": "[next-api-handler]",
  "level": "info"
}
```

We can simply replace `loggerOption` when initializing the router

```ts
const router = new RouterBuilder({
  loggerOption: {
    context: 'new name',
    level: 'silent',
  },
});
```

where `context` is the logger context, `level` satisfies type `LoggerLevel` and has available options `debug`, `info`, `warn`, `error`, `silent` in such a way that, when a level is configured, except `silent` only the level after and itself will be logged, e.g. when `level="warn"`, only `logger.warn` & `logger.error` will trigger the logger

When `level="silent"`, all logs will be hidden

By default, `level` is set based on different running environment

```sh
# when running in development i.e. NODE_ENV=development
level="info"

# when running in production i.e. NODE_ENV=production
level="error"

# when running tests i.e. NODE_ENV=test
level="silent"
```

## Utilities

### Type declaration & Type-checking

This package is carefully designed for TypesScript users to correctly enforce type definitions

For server side, we can declare return types in any of route handler

```ts
router.get<{ name: string }>(() => ({ name: 'John Doe' }));
```

We can share the response type for client side to reuse, e.g. here as axios

```ts
// export type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse;
// export type SuccessApiResponse<T> = { success: true; data: T };
// export type ErrorApiResponse = { success: false; message: string };

import axios from 'axios';
import type { SuccessApiResponse } from 'next-api-handler';

type User = { name: string };

const result = await axios.get<SuccessApiResponse<User>>('/api/...');
```

or with native `fetch` provided by next.js, it is easy to determine whether it is a successful api response

```ts
type User = { name: string };

const fetchLocalUser = async (args): Promise<User> => {
  const response = await fetch('/api/...', args);
  const result = (await response.json()) as ApiResponse<User>;

  if (!result?.success) {
    throw new Error(result.message);
  }

  // Here ts should be able to figure out it is SuccessApiResponse
  return result.data;
};
```

## Compatibility

As `next-api-handler` provides a general interface to generate `next.js` handler, it will be easy to work with other libraries like following:

```ts
import { RouterBuilder } from 'next-api-handler'

const router = new RouterBuilder()

router.get( ... )
router.post( ... )

// here handler has type 'NextApiHandler' exposed from 'next'
const handler = router.build()

// ... work with wrapper or other plugins
```

A quick example with [iron-session](https://github.com/vvo/iron-session):

```ts
// pages/api/user.ts

import { withIronSessionApiRoute } from 'iron-session/next';
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();
const handler = router.get((req) => req.session.user).build();

export default withIronSessionApiRoute(handler, {
  cookieName: 'myapp_cookiename',
  password: 'complex_password_at_least_32_characters_long',
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
});
```

## Reference

- Full API: please refer to [Github Page](https://howard86.github.io/next-api-handler/)
- Tests:
  - [unit tests](https://app.circleci.com/pipelines/github/Howard86/next-api-handler?branch=main) powered by [CircleCI](https://circleci.com)
  - [coverage](https://codecov.io/gh/Howard86/next-api-handler) check powered by [codecov](https://app.codecov.io)
  - [end-to-end tests](https://dashboard.cypress.io/projects/d5185e/runs) powered by [Cypress](https://www.cypress.io)
  - vulnerability check by [Snyk](https://snyk.io)
- Deployment: A [demo](https://next-api-handler.vercel.app) website deployed on [Vercel](https://vercel.com) with documentation site powered by [Github Page](https://pages.github.com)

## License

[MIT](/LICENSE)

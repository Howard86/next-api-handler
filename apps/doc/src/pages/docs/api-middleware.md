---
title: API Middleware
description: This page will walk you through the API middleware with examples.
---

This page will walk you through the API middleware with examples.

---

## Core concepts

If there are shared logic that you want to execute before the handler function, you can use `use` or `inject` method to add middleware to the router. Middleware also supports `async/await` syntax and error handling from previous [Restful API](/docs/restful-api) example.

```js
// server/middleware/auth.js
import {
  RouterBuilder,
  UnauthorizedException,
  NotFoundException,
} from 'next-api-handler';
import { verify, getUserInfo } from '@/services/auth';

export const authMiddleware = async (req, res) => {
  const apiKey = req.cookies['Authorization'];

  // some async service to check apiKey
  const isValid = await verify(apiKey);

  if (!isValid) throw new UnauthorizedException();

  // another async service to fetch user info
  const user = await getUserInfo(apiKey);

  if (!user) throw new NotFoundException();

  // this has to be an object or undefined (void function)
  return { user };
};
```

Then you can use the middleware in the router and pass on `user` from `req.middleware` to the handler function.

```js
// pages/api/users/me.js
import { RouterBuilder, ForbiddenException } from 'next-api-handler';
import { authMiddleware } from '@/server/middleware/auth';
import { updateUser } from '@/services/user';

const router = new RouterBuilder();

router
  .use(authMiddleware)
  .get((req) => req.middleware.user)
  .put((req) => {
    if (!req.middleware.user.isAdmin) throw new ForbiddenException();

    return updateUser(req.body);
  });

export default router.build();
```

{% callout type="warning" title="Reusing the word middleware" %}
The term _middleware_ could be misleading here.

[next-api-handler](https://www.npmjs.com/package/next-api-handler) middleware is different from [Express.js middleware](https://expressjs.com/en/guide/using-middleware.html) and [Next 12.0 middleware](https://nextjs.org/docs/advanced-features/middleware), and it is not a replacement for them nor a superset of them.

[next-api-handler](https://www.npmjs.com/package/next-api-handler) middleware will _only_ be executed _before_ the handler function, more like a shared logic as api handler middleware and can only be used in `next.js` API routes under `pages/api` directory.
{% /callout %}

---

## Multiple middleware

### Sequential execution

You can also use multiple middleware and pass on data from one middleware to another. As middleware is executed in the order of `use`, the data passed on will be in the same order.

```js
// server/middleware/cookie.js
import {
  RouterBuilder,
  UnauthorizedException,
  NotFoundException,
} from 'next-api-handler';
import { getEmailFromCookie } from '@/services/users';

export const cookieMiddleware = async (req, res) => {
  const email = getEmailFromCookie(req.cookies['Authorization']);

  if (!email) throw new UnauthorizedException();

  return { email };
};

export const userMiddleware = async (req, res) => {
  const user = await getUserByEmail(req.middleware.email);

  if (!user) throw new NotFoundException();

  return { user };
};
```

Then you can use the middleware in the router and pass on `user` from `req.middleware` to the handler function.

```js
// pages/api/users.js
import { RouterBuilder, ForbiddenException } from 'next-api-handler';
import { cookieMiddleware, userMiddleware } from '@/server/middleware/auth';
import { updateUser } from '@/services/user';

const router = new RouterBuilder();

router
  .use(cookieMiddleware)
  .use(userMiddleware)
  .get((req) => req.middleware.user)
  .put((req) => {
    if (!req.middleware.user.isAdmin) throw new ForbiddenException();

    return updateUser(req.body);
  });

export default router.build();
```

### Parallel execution

You can also use multiple middleware and execute them in parallel with `inject` method. This is useful when you want to fetch data from multiple services at the same time while still keeping the order of the data with `use` method in the end.

```js
// server/middleware/auth.js
import {
  RouterBuilder,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from 'next-api-handler';
import { verifyVersion, getEmailFromCookie } from '@/services/users';

export const versionMiddleware = (req, res) => {
  const version = req.headers['x-version'];

  if (!verifyVersion(version)) throw new BadRequestException();

  return { version };
};

export const cookieMiddleware = async (req, res) => {
  const email = getEmailFromCookie(req.cookies['Authorization']);

  if (!email) throw new UnauthorizedException();

  return { email };
};

export const userMiddleware = async (req, res) => {
  const user = await getUserByEmail(req.middleware.email);

  console.log(`Client side running version ${req.middleware.version}`);

  if (!user) throw new NotFoundException();

  return { user };
};
```

Then you can use the middleware in the router and pass on `user` from `req.middleware` to the handler function.

```js
// pages/api/users.js
import { RouterBuilder, ForbiddenException } from 'next-api-handler';
import {
  versionMiddleware,
  cookieMiddleware,
  userMiddleware,
} from '@/server/middleware/auth';
import { updateUser } from '@/services/user';

const router = new RouterBuilder();

router
  .inject(versionMiddleware)
  .inject(cookieMiddleware)
  .use(userMiddleware)
  .get((req) => req.middleware.user)
  .put((req) => {
    if (!req.middleware.user.isAdmin) throw new ForbiddenException();

    return updateUser(req.body);
  });

export default router.build();
```

### Route specific middleware

You can also use middleware that is only specific to a route. This is useful when you want to use the same middleware for multiple routes.

```js
// server/middleware/auth.js
import {
  RouterBuilder,
  UnauthorizedException,
  NotFoundException,
} from 'next-api-handler';
import { verify, getUserInfo } from '@/services/auth';

export const authMiddleware = async (req, res) => {
  const apiKey = req.cookies['Authorization'];

  // some async service to check apiKey
  const isValid = await verify(apiKey);

  if (!isValid) throw new UnauthorizedException();

  // another async service to fetch user info
  const user = await getUserInfo(apiKey);

  if (!user) throw new NotFoundException();

  // this has to be an object or undefined (void function)
  return { user };
};

export const adminMiddleware = async (req, res) => {
  if (!req.middleware.user.isAdmin) throw new ForbiddenException();
};
```

Then you can use the middleware in the router and pass on `user` from `req.middleware` to the handler function.

```js
// pages/api/users/me.js
import { RouterBuilder } from 'next-api-handler';
import { authMiddleware, adminMiddleware } from '@/server/middleware/auth';
import { updateUser } from '@/services/user';

const router = new RouterBuilder();

router
  .use(authMiddleware) // This is equivalent to use('ALL', authMiddleware)
  .use('PUT', adminMiddleware)
  .get((req) => req.middleware.user)
  .put((req) => updateUser(req.body));

export default router.build();
```

---

## Type safety

If you are using `TypeScript`, we can also enforce the response type by using generics. Here for demonstration purpose, we will put all middleware in one file. In production, you might consider splitting them into different business contexts.

```js
// server/middleware/auth.ts
import {
  RouterBuilder,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from 'next-api-handler';
import { verifyVersion, getEmailFromCookie } from '@/services/users';

export type VersionMiddleware = {
  version: string,
};

export const versionMiddleware: NextApiHandlerWithMiddleware<
  VersionMiddleware
> = (req, res) => {
  const version = req.headers['x-version'];

  if (!verifyVersion(version)) throw new BadRequestException();

  return { version };
};

export type CookieMiddleware = {
  email: string,
};

export const cookieMiddleware: NextApiHandlerWithMiddleware<
  CookieMiddleware
> = async (req, res) => {
  const email = getEmailFromCookie(req.cookies['Authorization']);

  if (!email) throw new UnauthorizedException();

  return { email };
};

export type User = {
  email: string,
  isAdmin: boolean,
};

export type UserMiddleware = {
  user: User,
};

// Here we can pass required pre-executed middleware to the handler
export const userMiddleware: NextApiHandlerWithMiddleware<
  UserMiddleware,
  CookieMiddleware
> = async (req, res) => {
  const user = await getUserByEmail(req.middleware.email);

  console.log(`Client side running version ${req.middleware.version}`);

  if (!user) throw new NotFoundException();

  return { user };
};

// Here we can pass void as the response type
export const adminMiddleware: NextApiHandlerWithMiddleware<
  void,
  UserMiddleware
> = async (req, res) => {
  if (!req.middleware.user.isAdmin) throw new ForbiddenException();
};
```

Then you can use the middleware in the router and pass on `user` from `req.middleware` to the handler function.

```ts
// pages/api/users.ts
import { RouterBuilder, BadRequestException } from 'next-api-handler';
import {
  versionMiddleware,
  cookieMiddleware,
  userMiddleware,
  adminMiddleware,
  type User,
  type UserMiddleware,
  type VersionMiddleware,
} from '@/server/middleware/auth';
import { updateUser, deleteUser } from '@/services/user';

const router = new RouterBuilder();

router
  .inject(versionMiddleware)
  .inject(cookieMiddleware)
  .use(userMiddleware)
  .use('PUT', adminMiddleware)
  .use('DELETE', adminMiddleware)
  .put<User>((req) => updateUser(req.body));
  // here we add required middleware type to the handler
  .get<User, UserMiddleware>(
    (req) => req.middleware.user
  )
  // here we can combine multiple middleware types
  .delete<User, UserMiddleware & VersionMiddleware>(
    async (req) => {
      const user = await deleteUser(req.middleware.user.email, req.middleware.version)

      if (!user) throw new BadRequestException('Unmatched version');

      return user
    }
  );

export default router.build();
```

## Sharing middleware

It might be tempted to create a router, register middleware and share between API routes, but it is not recommended. The reason is that the router will preserve usage of previous route specific middleware & handler, causing unexpected behavior.

Instead, create typed middleware in separate files and import them into the router when needed.

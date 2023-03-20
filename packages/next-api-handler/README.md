<p align="center">
  <a href="https://next-api-handler.vercel.app">
    <picture>
      <img src="https://raw.githubusercontent.com/Howard86/next-api-handler/main/apps/doc/public/square-logo.svg" height="96">
    </picture>
    <h1 align="center">next-api-handler</h1>
  </a>
</p>

---

[![install size](https://packagephobia.com/badge?p=next-api-handler)](https://packagephobia.com/result?p=next-api-handler)
[![CircleCI](https://circleci.com/gh/Howard86/next-api-handler/tree/main.svg?style=svg)](https://circleci.com/gh/Howard86/next-api-handler/tree/main)
[![codecov](https://codecov.io/gh/Howard86/next-api-handler/branch/main/graph/badge.svg?token=EIH9QQTLXT)](https://codecov.io/gh/Howard86/next-api-handler)
[![next-api-handler](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/d5185e/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/d5185e/runs)
![Known Vulnerabilities](https://snyk.io/test/github/howard86/next-api-handler/badge.svg)

## Lightweight and Portable [Next.js](https://nextjs.org) API builder

Building RESTful API routes in [Next.js](https://nextjs.org) with middleware support, predictable error handling and type-safe interfaces for client-server communication.

> Visit [https://next-api-handler.vercel.app](https://next-api-handler.vercel.app) to view the full documentation.

## Getting Started

**TL;DR**

```sh
npm install next-api-handler # or yarn, pnpm
```

```ts
// in /pages/api/users.ts
import { RouterBuilder, ForbiddenException } from 'next-api-handler';
import { createUser, type User } from '@/services/user';

const router = new RouterBuilder();

router
  .get<string>(() => 'Hello World')
  .post<User>(async (req) => createUser(req.body))
  .delete(() => {
    throw new ForbiddenException();
  });

export default router.build();
```

## License

[MIT](/LICENSE)

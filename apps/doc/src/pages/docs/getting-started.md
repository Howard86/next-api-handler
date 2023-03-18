---
title: Getting Started
description: Before you can start using next-api-handler, you'll need to install it in your Next.js application.
---

Before you can start using [next-api-handler](https://www.npmjs.com/package/next-api-handler), you'll need to install it in your Next.js application.

---

## Installing

Simply choose your favorite package manager to install [next-api-handler](https://www.npmjs.com/package/next-api-handler).

```bash
# npm
npm install next-api-handler

# yarn
yarn add next-api-handler

# pnpm
pnpm add next-api-handler
```

---

## Requirements

### Node.js

[next-api-handler](https://www.npmjs.com/package/next-api-handler) requires Node.js v8 or higher, where `next@9` supports Node.js v8.10 or higher.

> Please feel free to open an issue if you have any problems with new versions of Node.js.

### Next.js

[next-api-handler](https://www.npmjs.com/package/next-api-handler) requires Next.js v9 or higher, where it supports API routes.

---

## Add API routes

Import the `RouterBuilder` class from [next-api-handler](https://www.npmjs.com/package/next-api-handler), use it to create a new router in `pages/api` folder and export `router.build()` as default.

```js
// /pages/api/users.js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => 'Hello World!');

export default router.build();
```

[next-api-handler](https://www.npmjs.com/package/next-api-handler) will create an `json` response based on the return value of the handler function, and with default response structure as below:

```json
{
  "success": true,
  "data": "Hello World!"
}
```

If there are http requests not specified in the router, [next-api-handler](https://www.npmjs.com/package/next-api-handler) will return a `405 Method Not Allowed` response.

```json
{
  "success": false,
  "message": "Method Not Allowed"
}
```

Now you have created an API route in your Next.js application with just a few lines of code!

### Compatibility with Next.js 13.2 API routes

{% callout type="note" title="Next.js 13.2 API routes not supported" %}
Currently [next-api-handler](https://www.npmjs.com/package/next-api-handler) doesn't support `/apps/route` structure.

Please refer to [Next.js 13.2 API routes](https://beta.nextjs.org/docs/api-reference/file-conventions/route) for more details and consider raising an [issue](https://github.com/Howard86/next-api-handler/issues) if you have any suggestions.
{% /callout %}

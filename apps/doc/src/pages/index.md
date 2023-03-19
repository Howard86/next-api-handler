---
title: Overview
pageTitle: Next API Handler - A lightweight and portable Next.js API builder
description: Next API Handler is a versatile and portable tool for building RESTful API routes in Next.js, with middleware support, predictable error handling, and type-safe interfaces for client-server communication, making it an ideal solution for creating fast and efficient APIs in a variety of environments.
---

Learn how to get Next API Handler set up in your next.js project. {% .lead %}

{% quick-links %}

{% quick-link title="Getting Started" icon="installation" href="/docs/getting-started" description="Step-by-step guides to setting up your next.js project and installing the library." /%}

{% quick-link title="Core concepts" icon="presets" href="/docs/restful-api" description="Learn how to configure router builder based on different situations" /%}

{% quick-link title="API reference" icon="theming" href="/docs/router-builder" description="Check out the full list of available options and methods" /%}

{% quick-link title="External references" icon="plugins" href="/docs/related-libraries" description="Learn more from other open source projects" /%}

{% /quick-links %}

---

## Overview

[next-api-handler](https://www.npmjs.com/package/next-api-handler) is a lightweight and flexible API framework for Next.js applications. It provides an easy way to create API endpoints and handle requests and responses, while allowing for customization through middleware and advanced configuration options. Whether you're building a simple CRUD API or a complex web application with multiple endpoints, [next-api-handler](https://www.npmjs.com/package/next-api-handler) can help you streamline your development process.

## Features

[next-api-handler](https://www.npmjs.com/package/next-api-handler) offers the following features:

- Easy setup: Install [next-api-handler](https://www.npmjs.com/package/next-api-handler) using npm or Yarn and start creating API routes in your Next.js application with just a few lines of code.
- Error handling: Errors can be handled centrally or on a per-endpoint basis, making it easy to manage and debug issues in your API.
- Middleware: [next-api-handler](https://www.npmjs.com/package/next-api-handler) supports customizable middleware functions, allowing you to modify requests and responses as needed.
- API logger: [next-api-handler](https://www.npmjs.com/package/next-api-handler) includes built-in logging functionality to help you track API requests and responses.

## Quick start

> TL;DR

After installing [next-api-handler](https://www.npmjs.com/package/next-api-handler), you can start creating API routes in your Next.js application with just a few lines of code. Here's an example of a simple API route that returns a list of users:

```js
// /pages/api/users.js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get(() => [{ id: 1, name: 'John Doe' }]);

export default router.build();
```

To support multiple HTTP methods on the same endpoint, you can reuse the same router to create a route that handles multiple HTTP methods:

```js
// /pages/api/users.js
import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router
  .get(() => [{ id: 1, name: 'John Doe' }])
  .post((req) => {
    const { name } = req.body;
    return { id: 2, name };
  });

export default router.build();
```

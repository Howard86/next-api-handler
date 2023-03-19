---
title: HttpException
description: A class that extends the built-in Error class to provide a custom error object.
---

A class that extends the built-in Error class to provide a custom error object.

---

## constructor

A function that accepts a status code as number. a message as string and an optional default message as string as parameters.

```js
import { HttpException } from 'next-api-handler';

const error = new HttpException(404, 'User not found', 'Not Found');

throw error;
```

---

## Built-in subclasses of HttpException

There are some built-in HttpExceptions that extends `HttpException` class to provide a custom error object with a specific status code and default message.

For example, `BadRequestException` will accept a message as string instead

```js
import { BadRequestException } from 'next-api-handler';

const error = new BadRequestException('Something went wrong');

throw error;
```

{% callout type="note" title="Bundle size" %}
All of these are tree-shakable, so you can import only the exceptions that you need.
{% /callout %}

Please refer to [Built-in exceptions](/docs/restful-api#built-in-exceptions) section for more details.

---

Here we split into two categories, Client Error (status code `4xx`) and Server Error (status code `5xx`).

## Client Exception

Client Exception indicates that the client might have mistaken calling the API. For example, the client might have provided an invalid parameter.

### BadRequestException

A class that extends `HttpException` class to provide a custom error object with status code 400 and default message _Bad Request_.

### UnauthorizedException

A class that extends `HttpException` class to provide a custom error object with status code 401 and default message _Unauthorized_.

### ForbiddenException

A class that extends `HttpException` class to provide a custom error object with status code 403 and default message _Forbidden_.

### NotFoundException

A class that extends `HttpException` class to provide a custom error object with status code 404 and default message _Not Found_.

### NotAcceptableException

A class that extends `HttpException` class to provide a custom error object with status code 406 and default message _Not Acceptable_.

### RequestTimeoutException

A class that extends `HttpException` class to provide a custom error object with status code 408 and default message _Request Timeout_.

### ConflictException

A class that extends `HttpException` class to provide a custom error object with status code 409 and default message _Conflict_.

### GoneException

A class that extends `HttpException` class to provide a custom error object with status code 410 and default message _Gone_.

### PayloadTooLargeException

A class that extends `HttpException` class to provide a custom error object with status code 413 and default message _Payload Too Large_.

### UnsupportedMediaTypeException

A class that extends `HttpException` class to provide a custom error object with status code 415 and default message _Unsupported Media Type_.

### TooManyRequestsException

A class that extends `HttpException` class to provide a custom error object with status code 429 and default message _Too Many Requests_.

---

## Server Exception

Server Exception indicates that the server is not able to process the request. For example, the server might be down or overloaded.

### InternalServerErrorException

A class that extends `HttpException` class to provide a custom error object with status code 500 and default message _Internal Server Error_.

### NotImplementedException

A class that extends `HttpException` class to provide a custom error object with status code 501 and default message _Not Implemented_.

### BadGatewayException

A class that extends `HttpException` class to provide a custom error object with status code 502 and default message _Bad Gateway_.

### ServiceUnavailableException

A class that extends `HttpException` class to provide a custom error object with status code 503 and default message _Service Unavailable_.

### GatewayTimeoutException

A class that extends `HttpException` class to provide a custom error object with status code 504 and default message _Gateway Timeout_.

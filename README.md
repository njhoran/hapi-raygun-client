# hapi-raygun-client

A [Hapi.js](http://hapijs.com) v17+ plugin for reporting server-side errors to [Raygun](https://raygun.io).

## Usage

```js
import Hapi from 'hapi';
import Raygun from 'hapi-raygun-client';

const server = new Hapi.Server();

server.register({
  plugin: Raygun,
  options: {
    apiKey: /* Your Raygun API key */
  }
}, err => {
  if (err) {
    throw err;
  }

  server.start(() => {
    console.log("Server running at:", server.info.uri);
  });
});
```

## Configuration

- `options`
  - `apiKey` - String. Your Raygun API key. If not set, no error handler will be registered and plugin will be a no-op.
  - `filters` - Array, default `["password"]`. Array of strings to filter from payload sent to Raygun (see [this](https://github.com/MindscapeHQ/raygun4node#sending-request-data) for example)
  - `log` - Boolean, default `false`. If `true`, uses `server.log()` to log when plugin logs calls to Raygun. Depends on logging to be setup properly, i.e. use [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) configured to log server log events.
  - `user` - Function. Takes a callback accepting a single argument and returning the request's user context. See Raygun [documentation for user callback](https://github.com/MindscapeHQ/raygun4node#affected-user-tracking)
  - `version` - String. Format of "n.n.n.n" where `n` is a number. See [raygun docs](https://github.com/MindscapeHQ/raygun4node#version-tracking)

## Collaborators

- [@craigbeck](https://github.com/craigbeck) who wrote the original [hapi-raygun](git@github.com:njhoran/hapi-raygun-client.git) plugin
- [@njhoran](https://github.com/njhoran) who took the original and rewrote it's plugin interface to work with hapi v17 +

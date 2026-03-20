# nice-logger

A minimal logger middleware for Elysia with global logger functions you can use anywhere.

Forked from the original project by Tanishq Manuja:  
https://github.com/tanishqmanuja/nice-logger

## Installation

```bash
bun add @factiven/nice-logger
```

## Elysia middleware usage

```ts
import Elysia from "elysia";
import { logger } from "@factiven/nice-logger";

new Elysia()
  .use(
    logger({
      enabled: true, // turn middleware logging on/off
      mode: "combined", // "combined" (single line after response) or "live" (request + response lines)
      withTimestamp: true, // prepend timestamp to each middleware log line
      withBanner: {
        Server: "http://localhost:3000", // key/value lines shown on startup
        Docs: "http://localhost:3000/docs", // additional startup info
      }, // false to disable banner, true for default banner, function/object for custom banner
    }),
  )
  .get("/", "ok")
  .listen(3000);
```

## Global logger usage (anywhere in your code)

```ts
import {
  configureGlobalLogger,
  info,
  debug,
  warn,
  error,
} from "@factiven/nice-logger";

configureGlobalLogger({
  enabled: true, // turn global logging on/off
  withTimestamp: true, // prepend timestamp to global log lines
  pretty: false, // true => pretty-printed JSON objects, false => compact JSON
});

info("Server started");
debug("Feature flags", { ai: true, cache: "redis" });
warn("Rate limit threshold", { userId: "u_123" });
error("Unhandled exception", new Error("Oops"));
```

Example output:

```txt
[3/20/2026, 4:12:13 PM] INFO Server started
[3/20/2026, 4:12:13 PM] DEBUG {"ai":true,"cache":"redis"}
[3/20/2026, 4:12:13 PM] WARN Rate limit threshold {"userId":"u_123"}
[3/20/2026, 4:12:13 PM] ERROR {"name":"Error","message":"Oops","stack":"..."}
```

## Full options reference (examples)

### `logger(options)`

```ts
logger({
  enabled: process.env.NODE_ENV !== "production", // disable middleware logs in production by default
  mode: "combined", // "combined" | "live"
  withTimestamp: false, // boolean | (() => string)
  withBanner: false, // boolean | (() => void) | Record<string, string | ((ctx) => string | undefined)>
});
```

### `configureGlobalLogger(options)`

```ts
configureGlobalLogger({
  enabled: process.env.NODE_ENV !== "production", // disable global logs in production by default
  withTimestamp: false, // boolean | (() => string)
  pretty: false, // pretty-print objects/errors
});
```

## Exported API

```ts
import {
  logger, // Elysia middleware plugin
  configureGlobalLogger, // update global logger behavior
  getGlobalLoggerConfig, // read current global logger config
  resetGlobalLoggerConfig, // reset global logger config to defaults
  info, // global INFO logger
  debug, // global DEBUG logger
  warn, // global WARN logger
  error, // global ERROR logger
} from "@factiven/nice-logger";
```

## License

MIT

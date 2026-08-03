var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { Elysia } from "elysia";
import pc2 from "picocolors";

// src/formatters.ts
import pc from "picocolors";
var UNITS = ["\xB5s", "ms", "s"];
var DURATION_FORMATTER = Intl.NumberFormat(void 0, {
  maximumFractionDigits: 2
});
function duration(duration2) {
  if (duration2 == null) return "-/-";
  let value = duration2;
  let unitIndex = 0;
  while (value >= 1e3 && unitIndex < UNITS.length - 1) {
    value /= 1e3;
    unitIndex++;
  }
  return `${DURATION_FORMATTER.format(value)}${UNITS[unitIndex]}`;
}
var METHOD_COLOR_LUT = {
  GET: pc.green,
  POST: pc.blue,
  PUT: pc.yellow,
  DELETE: pc.red,
  PATCH: pc.magenta,
  OPTIONS: pc.cyan,
  HEAD: pc.gray
};
function method(method2) {
  const colorer = METHOD_COLOR_LUT[method2.toUpperCase()];
  return colorer ? colorer(method2) : method2;
}
var STATUS_COLOR_LUT = {
  200: pc.green,
  201: pc.blue,
  204: pc.yellow,
  400: pc.red,
  401: pc.magenta,
  403: pc.cyan,
  404: pc.gray,
  500: pc.gray
};
function status(status2) {
  if (status2 === void 0) return "";
  const colorer = STATUS_COLOR_LUT[+status2];
  return colorer ? colorer(String(status2)) : String(status2);
}
var LEVEL_COLOR_LUT = {
  debug: pc.magenta,
  info: pc.cyan,
  warn: pc.yellow,
  error: pc.red
};
var LEVEL_LABEL_LUT = {
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR"
};
function level(level2) {
  const label = LEVEL_LABEL_LUT[level2] ?? String(level2).toUpperCase();
  const colorer = LEVEL_COLOR_LUT[level2] ?? pc.white;
  return colorer(label);
}
function isErrorLike(value) {
  return value instanceof Error;
}
function serializeError(error2) {
  return {
    name: error2.name,
    message: error2.message,
    stack: error2.stack,
    ...error2
  };
}
function createCircularReplacer() {
  const seen = /* @__PURE__ */ new WeakSet();
  return (_key, value) => {
    if (typeof value === "bigint") return `${value}n`;
    if (isErrorLike(value)) return serializeError(value);
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
}
function safeStringify(value, space = 0, fallback = "[Unserializable]") {
  try {
    return JSON.stringify(value, createCircularReplacer(), space);
  } catch {
    try {
      return String(value);
    } catch {
      return fallback;
    }
  }
}
function formatValue(value, options = {}) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return String(value);
  }
  return safeStringify(value, options.pretty ? 2 : 0);
}
function formatValues(values, options = {}) {
  return values.map((value) => formatValue(value, options)).join(" ");
}

// src/index.ts
var requestStates = /* @__PURE__ */ new WeakMap();
var defaultGlobalOptions = {
  enabled: process.env.NODE_ENV !== "production",
  withTimestamp: false,
  pretty: false
};
var globalLoggerOptions = {
  ...defaultGlobalOptions
};
function resolveTimestamp(withTimestamp) {
  const value = typeof withTimestamp === "function" ? withTimestamp() : (/* @__PURE__ */ new Date()).toLocaleString();
  return pc2.dim(`[${value}]`);
}
function emitLine(parts, level2 = "log") {
  const line = parts.filter(Boolean).join(" ");
  if (level2 === "error") {
    console.error(line);
    return;
  }
  if (level2 === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
function print(level2, ...args) {
  if (!globalLoggerOptions.enabled) return;
  const payload = formatValues(args, {
    pretty: globalLoggerOptions.pretty
  });
  emitLine(
    [
      globalLoggerOptions.withTimestamp ? resolveTimestamp(globalLoggerOptions.withTimestamp) : "",
      pc2.bold(level(level2)),
      payload
    ],
    level2 === "error" ? "error" : level2 === "warn" ? "warn" : "log"
  );
}
function configureGlobalLogger(options = {}) {
  globalLoggerOptions = {
    ...globalLoggerOptions,
    ...options
  };
}
function resetGlobalLoggerConfig() {
  globalLoggerOptions = { ...defaultGlobalOptions };
}
function getGlobalLoggerConfig() {
  return globalLoggerOptions;
}
function info(...args) {
  print("info", ...args);
}
function debug(...args) {
  print("debug", ...args);
}
function warn(...args) {
  print("warn", ...args);
}
function error(...args) {
  print("error", ...args);
}
var logger = (options = {}) => {
  const { enabled = process.env.NODE_ENV !== "production", mode = "combined" } = options;
  const app = new Elysia({
    name: "@tqman/nice-logger",
    seed: options
  });
  if (!enabled) return app;
  const ts = options.withTimestamp;
  app.setup((ctx) => {
    if (!options.withBanner) return;
    if (typeof options.withBanner === "function") {
      options.withBanner();
      return;
    }
    const ELYSIA_VERSION = __require("elysia/package.json").version;
    emitLine([`\u{1F98A} ${pc2.green(`${pc2.bold("Elysia")} v${ELYSIA_VERSION}`)}`]);
    if (typeof options.withBanner === "object") {
      Object.entries(options.withBanner).forEach(([key, value]) => {
        const v = typeof value === "function" ? value(ctx) : value;
        if (!v) return;
        emitLine([`${pc2.green(" \u279C ")} ${pc2.bold(key)}: ${pc2.cyan(v)}`]);
      });
      emitLine([""]);
      return;
    }
    emitLine([
      `${pc2.green(" \u279C ")} ${pc2.bold("Server")}: ${pc2.cyan(String(ctx.server?.url))}
`
    ]);
  }).request((ctx) => {
    requestStates.set(ctx.request, {
      start: process.hrtime.bigint(),
      errored: false
    });
    if (mode !== "live") return;
    const url = new URL(ctx.request.url);
    emitLine([
      ts ? resolveTimestamp(ts) : "",
      pc2.blue("--->"),
      pc2.bold(method(ctx.request.method)),
      url.pathname
    ]);
  }).afterResponse(({ request, set, responseValue }) => {
    const state = requestStates.get(request);
    if (!state || state.errored) return;
    if (responseValue instanceof Error) return;
    const url = new URL(request.url);
    const duration2 = Number(process.hrtime.bigint() - state.start) / 1e3;
    const sign = mode === "combined" ? pc2.green("\u2713") : pc2.green("<---");
    emitLine([
      ts ? resolveTimestamp(ts) : "",
      sign,
      pc2.bold(method(request.method)),
      url.pathname,
      status(set.status),
      pc2.dim(`[${duration(duration2)}]`)
    ]);
  }).error(({ request, error: error2 }) => {
    const state = requestStates.get(request);
    if (state) state.errored = true;
    const url = new URL(request.url);
    const duration2 = state ? Number(process.hrtime.bigint() - state.start) / 1e3 : null;
    const status2 = "status" in error2 ? error2.status : 500;
    const sign = mode === "combined" ? pc2.red("\u2717") : pc2.red("<-x-");
    emitLine([
      ts ? resolveTimestamp(ts) : "",
      sign,
      pc2.bold(method(request.method)),
      url.pathname,
      status(status2),
      pc2.dim(`[${duration(duration2)}]`)
    ]);
  });
  return app.as("plugin");
};
export {
  configureGlobalLogger,
  debug,
  error,
  getGlobalLoggerConfig,
  info,
  logger,
  resetGlobalLoggerConfig,
  warn
};

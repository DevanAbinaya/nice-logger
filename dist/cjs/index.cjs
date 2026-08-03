"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  configureGlobalLogger: () => configureGlobalLogger,
  debug: () => debug,
  error: () => error,
  getGlobalLoggerConfig: () => getGlobalLoggerConfig,
  info: () => info,
  logger: () => logger,
  resetGlobalLoggerConfig: () => resetGlobalLoggerConfig,
  warn: () => warn
});
module.exports = __toCommonJS(index_exports);
var import_elysia = require("elysia");
var import_picocolors2 = __toESM(require("picocolors"), 1);

// src/formatters.ts
var import_picocolors = __toESM(require("picocolors"), 1);
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
  GET: import_picocolors.default.green,
  POST: import_picocolors.default.blue,
  PUT: import_picocolors.default.yellow,
  DELETE: import_picocolors.default.red,
  PATCH: import_picocolors.default.magenta,
  OPTIONS: import_picocolors.default.cyan,
  HEAD: import_picocolors.default.gray
};
function method(method2) {
  const colorer = METHOD_COLOR_LUT[method2.toUpperCase()];
  return colorer ? colorer(method2) : method2;
}
var STATUS_COLOR_LUT = {
  200: import_picocolors.default.green,
  201: import_picocolors.default.blue,
  204: import_picocolors.default.yellow,
  400: import_picocolors.default.red,
  401: import_picocolors.default.magenta,
  403: import_picocolors.default.cyan,
  404: import_picocolors.default.gray,
  500: import_picocolors.default.gray
};
function status(status2) {
  if (status2 === void 0) return "";
  const colorer = STATUS_COLOR_LUT[+status2];
  return colorer ? colorer(String(status2)) : String(status2);
}
var LEVEL_COLOR_LUT = {
  debug: import_picocolors.default.magenta,
  info: import_picocolors.default.cyan,
  warn: import_picocolors.default.yellow,
  error: import_picocolors.default.red
};
var LEVEL_LABEL_LUT = {
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR"
};
function level(level2) {
  const label = LEVEL_LABEL_LUT[level2] ?? String(level2).toUpperCase();
  const colorer = LEVEL_COLOR_LUT[level2] ?? import_picocolors.default.white;
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
  return import_picocolors2.default.dim(`[${value}]`);
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
      import_picocolors2.default.bold(level(level2)),
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
  const app = new import_elysia.Elysia({
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
    const ELYSIA_VERSION = require("elysia/package.json").version;
    emitLine([`\u{1F98A} ${import_picocolors2.default.green(`${import_picocolors2.default.bold("Elysia")} v${ELYSIA_VERSION}`)}`]);
    if (typeof options.withBanner === "object") {
      Object.entries(options.withBanner).forEach(([key, value]) => {
        const v = typeof value === "function" ? value(ctx) : value;
        if (!v) return;
        emitLine([`${import_picocolors2.default.green(" \u279C ")} ${import_picocolors2.default.bold(key)}: ${import_picocolors2.default.cyan(v)}`]);
      });
      emitLine([""]);
      return;
    }
    emitLine([
      `${import_picocolors2.default.green(" \u279C ")} ${import_picocolors2.default.bold("Server")}: ${import_picocolors2.default.cyan(String(ctx.server?.url))}
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
      import_picocolors2.default.blue("--->"),
      import_picocolors2.default.bold(method(ctx.request.method)),
      url.pathname
    ]);
  }).afterResponse(({ request, set, responseValue }) => {
    const state = requestStates.get(request);
    if (!state || state.errored) return;
    if (responseValue instanceof Error) return;
    const url = new URL(request.url);
    const duration2 = Number(process.hrtime.bigint() - state.start) / 1e3;
    const sign = mode === "combined" ? import_picocolors2.default.green("\u2713") : import_picocolors2.default.green("<---");
    emitLine([
      ts ? resolveTimestamp(ts) : "",
      sign,
      import_picocolors2.default.bold(method(request.method)),
      url.pathname,
      status(set.status),
      import_picocolors2.default.dim(`[${duration(duration2)}]`)
    ]);
  }).error(({ request, error: error2 }) => {
    const state = requestStates.get(request);
    if (state) state.errored = true;
    const url = new URL(request.url);
    const duration2 = state ? Number(process.hrtime.bigint() - state.start) / 1e3 : null;
    const status2 = "status" in error2 ? error2.status : 500;
    const sign = mode === "combined" ? import_picocolors2.default.red("\u2717") : import_picocolors2.default.red("<-x-");
    emitLine([
      ts ? resolveTimestamp(ts) : "",
      sign,
      import_picocolors2.default.bold(method(request.method)),
      url.pathname,
      status(status2),
      import_picocolors2.default.dim(`[${duration(duration2)}]`)
    ]);
  });
  return app.as("plugin");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configureGlobalLogger,
  debug,
  error,
  getGlobalLoggerConfig,
  info,
  logger,
  resetGlobalLoggerConfig,
  warn
});

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

// src/formatters.ts
var formatters_exports = {};
__export(formatters_exports, {
  duration: () => duration,
  formatValue: () => formatValue,
  formatValues: () => formatValues,
  level: () => level,
  method: () => method,
  safeStringify: () => safeStringify,
  status: () => status
});
module.exports = __toCommonJS(formatters_exports);
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
function serializeError(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...error
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  duration,
  formatValue,
  formatValues,
  level,
  method,
  safeStringify,
  status
});

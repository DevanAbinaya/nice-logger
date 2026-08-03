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
export {
  duration,
  formatValue,
  formatValues,
  level,
  method,
  safeStringify,
  status
};

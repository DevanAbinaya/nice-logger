import pc from "picocolors";
import type { Formatter } from "picocolors/types";

/* Formatter for DURATION */

const UNITS = ["µs", "ms", "s"] as const;
const DURATION_FORMATTER = Intl.NumberFormat(undefined, {
	maximumFractionDigits: 2,
});

export function duration(duration: number | null): string {
	if (duration == null) return "-/-";

	let value = duration;
	let unitIndex = 0;

	while (value >= 1000 && unitIndex < UNITS.length - 1) {
		value /= 1000;
		unitIndex++;
	}

	return `${DURATION_FORMATTER.format(value)}${UNITS[unitIndex]}`;
}

/* Formatter for METHOD */

const METHOD_COLOR_LUT = {
	GET: pc.green,
	POST: pc.blue,
	PUT: pc.yellow,
	DELETE: pc.red,
	PATCH: pc.magenta,
	OPTIONS: pc.cyan,
	HEAD: pc.gray,
} satisfies Record<string, Formatter>;

export function method(method: string): string {
	const colorer = METHOD_COLOR_LUT[method.toUpperCase()];
	return colorer ? colorer(method) : method;
}

/* Formatter for STATUS */

const STATUS_COLOR_LUT = {
	200: pc.green,
	201: pc.blue,
	204: pc.yellow,
	400: pc.red,
	401: pc.magenta,
	403: pc.cyan,
	404: pc.gray,
	500: pc.gray,
} satisfies Record<number, Formatter>;

export function status(status: string | number | undefined): string {
	if (status === undefined) return "";

	const colorer = STATUS_COLOR_LUT[+status];
	return colorer ? colorer(String(status)) : String(status);
}

/* Formatter for LOG LEVEL */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_COLOR_LUT: Record<LogLevel, Formatter> = {
	debug: pc.magenta,
	info: pc.cyan,
	warn: pc.yellow,
	error: pc.red,
};

const LEVEL_LABEL_LUT: Record<LogLevel, string> = {
	debug: "DEBUG",
	info: "INFO",
	warn: "WARN",
	error: "ERROR",
};

export function level(level: LogLevel): string {
	const label = LEVEL_LABEL_LUT[level] ?? String(level).toUpperCase();
	const colorer = LEVEL_COLOR_LUT[level] ?? pc.white;
	return colorer(label);
}

/* Safe value formatting utilities */

type JsonLikeObject = Record<string, unknown>;

function isErrorLike(value: unknown): value is Error {
	return value instanceof Error;
}

function serializeError(error: Error): JsonLikeObject {
	return {
		name: error.name,
		message: error.message,
		stack: error.stack,
		...(error as unknown as JsonLikeObject),
	};
}

function createCircularReplacer() {
	const seen = new WeakSet<object>();

	return (_key: string, value: unknown) => {
		if (typeof value === "bigint") return `${value}n`;

		if (isErrorLike(value)) return serializeError(value);

		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) return "[Circular]";
			seen.add(value);
		}

		return value;
	};
}

export function safeStringify(
	value: unknown,
	space = 0,
	fallback = "[Unserializable]",
): string {
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

export function formatValue(
	value: unknown,
	options: { pretty?: boolean } = {},
): string {
	if (typeof value === "string") return value;
	if (
		typeof value === "number" ||
		typeof value === "boolean" ||
		value == null
	) {
		return String(value);
	}

	return safeStringify(value, options.pretty ? 2 : 0);
}

export function formatValues(
	values: unknown[],
	options: { pretty?: boolean } = {},
): string {
	return values.map((value) => formatValue(value, options)).join(" ");
}

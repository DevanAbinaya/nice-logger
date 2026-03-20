import { Elysia } from "elysia";
import pc from "picocolors";

import * as fmt from "./formatters";

const REQUEST_START_TIME_KEY = "@tqman/nice-logger/request-start-time";

type GlobalLogLevel = "info" | "debug" | "warn" | "error";
type LogArgument = unknown;
type TimestampOption = boolean | (() => string);

export interface LoggerOptions {
	enabled?: boolean;
	mode?: "combined" | "live";
	withTimestamp?: TimestampOption;
	withBanner?:
		| boolean
		| (() => void)
		| Record<string, string | ((ctx: Elysia) => string | undefined)>;
}

export interface GlobalLoggerOptions {
	enabled?: boolean;
	withTimestamp?: TimestampOption;
	pretty?: boolean;
}

const defaultGlobalOptions: Required<GlobalLoggerOptions> = {
	enabled: process.env.NODE_ENV !== "production",
	withTimestamp: false,
	pretty: false,
};

let globalLoggerOptions: Required<GlobalLoggerOptions> = {
	...defaultGlobalOptions,
};

function resolveTimestamp(withTimestamp: TimestampOption): string {
	const value =
		typeof withTimestamp === "function"
			? withTimestamp()
			: new Date().toLocaleString();

	return pc.dim(`[${value}]`);
}

function emitLine(
	parts: Array<string | false | null | undefined>,
	level: "log" | "warn" | "error" = "log",
): void {
	const line = parts.filter(Boolean).join(" ");

	if (level === "error") {
		console.error(line);
		return;
	}

	if (level === "warn") {
		console.warn(line);
		return;
	}

	console.log(line);
}

function print(level: GlobalLogLevel, ...args: LogArgument[]): void {
	if (!globalLoggerOptions.enabled) return;

	const payload = fmt.formatValues(args, {
		pretty: globalLoggerOptions.pretty,
	});

	emitLine(
		[
			globalLoggerOptions.withTimestamp
				? resolveTimestamp(globalLoggerOptions.withTimestamp)
				: "",
			pc.bold(fmt.level(level)),
			payload,
		],
		level === "error" ? "error" : level === "warn" ? "warn" : "log",
	);
}

export function configureGlobalLogger(options: GlobalLoggerOptions = {}): void {
	globalLoggerOptions = {
		...globalLoggerOptions,
		...options,
	};
}

export function resetGlobalLoggerConfig(): void {
	globalLoggerOptions = { ...defaultGlobalOptions };
}

export function getGlobalLoggerConfig(): Readonly<
	Required<GlobalLoggerOptions>
> {
	return globalLoggerOptions;
}

export function info(...args: LogArgument[]): void {
	print("info", ...args);
}

export function debug(...args: LogArgument[]): void {
	print("debug", ...args);
}

export function warn(...args: LogArgument[]): void {
	print("warn", ...args);
}

export function error(...args: LogArgument[]): void {
	print("error", ...args);
}

export const logger = (options: LoggerOptions = {}) => {
	const { enabled = process.env.NODE_ENV !== "production", mode = "combined" } =
		options;

	const app = new Elysia({
		name: "@tqman/nice-logger",
		seed: options,
	});

	if (!enabled) return app;

	const ts = options.withTimestamp;

	app
		.onStart((ctx) => {
			if (!options.withBanner) return;

			if (typeof options.withBanner === "function") {
				options.withBanner();
				return;
			}

			const ELYSIA_VERSION = require("elysia/package.json").version;
			emitLine([`🦊 ${pc.green(`${pc.bold("Elysia")} v${ELYSIA_VERSION}`)}`]);

			if (typeof options.withBanner === "object") {
				Object.entries(options.withBanner).forEach(([key, value]) => {
					const v = typeof value === "function" ? value(ctx) : value;
					if (!v) return;
					emitLine([`${pc.green(" ➜ ")} ${pc.bold(key)}: ${pc.cyan(v)}`]);
				});

				emitLine([""]);
				return;
			}

			emitLine([
				`${pc.green(" ➜ ")} ${pc.bold("Server")}: ${pc.cyan(String(ctx.server?.url))}\n`,
			]);
		})
		.onRequest((ctx) => {
			ctx.store = {
				...ctx.store,
				[REQUEST_START_TIME_KEY]: process.hrtime.bigint(),
			};

			if (mode !== "live") return;

			const url = new URL(ctx.request.url);

			emitLine([
				ts ? resolveTimestamp(ts) : "",
				pc.blue("--->"),
				pc.bold(fmt.method(ctx.request.method)),
				url.pathname,
			]);
		})
		.onAfterResponse(({ request, set, response, store }) => {
			if (response instanceof Error) return;

			const url = new URL(request.url);
			const duration =
				Number(
					process.hrtime.bigint() - (store as any)[REQUEST_START_TIME_KEY],
				) / 1000;

			const sign = mode === "combined" ? pc.green("✓") : pc.green("<---");

			emitLine([
				ts ? resolveTimestamp(ts) : "",
				sign,
				pc.bold(fmt.method(request.method)),
				url.pathname,
				fmt.status(set.status),
				pc.dim(`[${fmt.duration(duration)}]`),
			]);
		})
		.onError(({ request, error, store }) => {
			const url = new URL(request.url);
			const duration = (store as any)[REQUEST_START_TIME_KEY]
				? Number(
						process.hrtime.bigint() - (store as any)[REQUEST_START_TIME_KEY],
					) / 1000
				: null;
			const status = "status" in error ? error.status : 500;

			const sign = mode === "combined" ? pc.red("✗") : pc.red("<-x-");

			emitLine([
				ts ? resolveTimestamp(ts) : "",
				sign,
				pc.bold(fmt.method(request.method)),
				url.pathname,
				fmt.status(status),
				pc.dim(`[${fmt.duration(duration)}]`),
			]);
		});

	return app.as("plugin");
};

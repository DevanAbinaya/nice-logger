import { Elysia } from "elysia";
type LogArgument = unknown;
type TimestampOption = boolean | (() => string);
export interface LoggerOptions {
    enabled?: boolean;
    mode?: "combined" | "live";
    withTimestamp?: TimestampOption;
    withBanner?: boolean | (() => void) | Record<string, string | ((ctx: Elysia) => string | undefined)>;
}
export interface GlobalLoggerOptions {
    enabled?: boolean;
    withTimestamp?: TimestampOption;
    pretty?: boolean;
}
export declare function configureGlobalLogger(options?: GlobalLoggerOptions): void;
export declare function resetGlobalLoggerConfig(): void;
export declare function getGlobalLoggerConfig(): Readonly<Required<GlobalLoggerOptions>>;
export declare function info(...args: LogArgument[]): void;
export declare function debug(...args: LogArgument[]): void;
export declare function warn(...args: LogArgument[]): void;
export declare function error(...args: LogArgument[]): void;
export declare const logger: (options?: LoggerOptions) => Elysia<"", "local", import("elysia/dist/types").DefaultSingleton, {
    typebox: {};
    error: [];
}, import("elysia/dist/types").DefaultMetadata, {}, import("elysia/dist/types").DefaultEphemeral, import("elysia/dist/types").DefaultEphemeral>;
export {};

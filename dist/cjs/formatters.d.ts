export declare function duration(duration: number | null): string;
export declare function method(method: string): string;
export declare function status(status: string | number | undefined): string;
export type LogLevel = "debug" | "info" | "warn" | "error";
export declare function level(level: LogLevel): string;
export declare function safeStringify(value: unknown, space?: number, fallback?: string): string;
export declare function formatValue(value: unknown, options?: {
    pretty?: boolean;
}): string;
export declare function formatValues(values: unknown[], options?: {
    pretty?: boolean;
}): string;

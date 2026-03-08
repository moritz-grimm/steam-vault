/**
 * Safely converts an `unknown` catch value to an `Error`.
 * Returns the value as-is if already an `Error`, otherwise wraps it with `String()`.
 */
export function toError(err: unknown): Error {
    return err instanceof Error
        ? err
        : new Error(String(err));
}

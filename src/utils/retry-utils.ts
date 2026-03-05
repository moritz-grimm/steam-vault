export async function attemptWithRetries<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number, onRetry?: (attempt: number, err: unknown) => void): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxAttempts) throw err;
            onRetry?.(attempt, err);
            await new Promise(r => setTimeout(r, delayMs * attempt));
        }
    }
    throw new Error("Unreachable"); // Unreachable error to make Typescript shut up
}

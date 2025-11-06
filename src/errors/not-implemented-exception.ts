/**
 * A custom implementation of a NotImplementedException because JavaScript/TypeScript does not support it natively.
 */
export class NotImplementedException extends Error {
    constructor(message?: string) {
        super(message || "Method not implemented");
        this.name = "NotImplementedException";
    }
};

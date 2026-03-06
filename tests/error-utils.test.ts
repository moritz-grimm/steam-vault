import { toError } from "src/utils/error-utils";
import { describe, expect, test } from "vitest";

describe("toError", () => {
    test("returns the same Error instance if given an Error", () => {
        const original = new Error("something went wrong");
        const result = toError(original);

        expect(result).toBe(original);
        expect(result.message).toBe("something went wrong");
    });

    test("wraps a string in an Error", () => {
        const result = toError("string error");

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("string error");
    });

    test("wraps a number in an Error", () => {
        const result = toError(42);

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("42");
    });

    test("wraps null in an Error", () => {
        const result = toError(null);

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("null");
    });

    test("wraps undefined in an Error", () => {
        const result = toError(undefined);

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("undefined");
    });
});

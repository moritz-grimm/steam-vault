import { sanitizeGameTitle } from "src/utils/string-utils";
import { describe, expect, test } from "vitest";

describe("sanitizeGameTitle", () => {
    test("replace colons", () => {
        const sanitizedTitle = sanitizeGameTitle("Cyberpunk: 2077");

        expect(sanitizedTitle).toBe("Cyberpunk - 2077");
    });

    test("replace slash", () => {
        const sanitizedTitle = sanitizeGameTitle("Pokemon Red/Blue");

        expect(sanitizedTitle).toBe("Pokemon Red Blue");
    });

    test(String.raw`replace '\', '*', '?', '"', '<', '>', '|'`, () => {
        const sanitizedTitle = sanitizeGameTitle('"Weird*" G<m> \Nam?|');

        expect(sanitizedTitle).toBe("Weird Gm Nam");
    });
});

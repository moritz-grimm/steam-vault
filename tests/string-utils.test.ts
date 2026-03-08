import { sanitizeGameTitle } from "src/utils/string-utils";
import { describe, expect, test } from "vitest";

describe("sanitizeGameTitle", () => {
    test("leave normal title unchanged", () => {
        expect(sanitizeGameTitle("Half-Life 2")).toBe("Half-Life 2");
    });

    test("replace colons", () => {
        expect(sanitizeGameTitle("Cyberpunk: 2077")).toBe("Cyberpunk - 2077");
    });

    test("replace slash", () => {
        expect(sanitizeGameTitle("Pokemon Red/Blue")).toBe("Pokemon Red Blue");
    });

    test.each([
        ["\\", ""],
        ["*", ""],
        ["?", ""],
        // eslint-disable-next-line stylistic/quotes
        ['"', ""],
        ["<", ""],
        [">", ""],
        ["|", ""],
    ])("remove '%s'", (char, expected) => {
        expect(sanitizeGameTitle(char)).toBe(expected);
    });

    test("combine multiple whitespaces", () => {
        expect(sanitizeGameTitle("Multiple   Whitespaces    Game  III  ")).toBe("Multiple Whitespaces Game III");
    });

    test("handle empty string", () => {
        expect(sanitizeGameTitle("")).toBe("");
    });

    test("handle string with only special characters", () => {
        expect(sanitizeGameTitle("***")).toBe("");
    });

    test("strip trademark symbols", () => {
        expect(sanitizeGameTitle("DOOM®")).toBe("DOOM");
        expect(sanitizeGameTitle("The Witcher™")).toBe("The Witcher");
    });
});

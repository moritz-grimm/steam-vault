import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadJson, loadJsonAsync, writeToJson, writeToJsonAsync } from "src/utils/json-utils";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

let tmpDir: string;

beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "json-utils-"));
});

afterEach(() => {
    rmSync(tmpDir, { recursive: true });
});

describe("writeToJson", () => {
    test("write object to file", () => {
        const file = join(tmpDir, "test.json");
        writeToJson(file, { key: "value" });
        expect(loadJson(file)).toEqual({ key: "value" });
    });

    test("write with 4-space indentation", () => {
        const file = join(tmpDir, "test.json");
        writeToJson(file, { a: 1 });
        const raw = readFileSync(file, "utf-8");
        expect(raw).toBe(JSON.stringify({ a: 1 }, null, 4));
    });
});

describe("writeToJsonAsync", () => {
    test("write object to file", async() => {
        const file = join(tmpDir, "test.json");
        await writeToJsonAsync(file, { async: true });
        expect(loadJson(file)).toEqual({ async: true });
    });

    test("write with 4-space indentation", async() => {
        const file = join(tmpDir, "test.json");
        await writeToJsonAsync(file, { a: 1 });
        const raw = await readFile(file, "utf-8");
        expect(raw).toBe(JSON.stringify({ a: 1 }, null, 4));
    });
});

describe("loadJson", () => {
    test("load valid JSON", () => {
        const file = join(tmpDir, "data.json");
        writeFileSync(file, "{\"name\":\"test\"}", "utf-8");
        expect(loadJson(file)).toEqual({ name: "test" });
    });

    test("return empty object for empty file", () => {
        const file = join(tmpDir, "empty.json");
        writeFileSync(file, "", "utf-8");
        expect(loadJson(file)).toEqual({});
    });

    test("return empty object for whitespace-only file", () => {
        const file = join(tmpDir, "whitespace.json");
        writeFileSync(file, "   \n  ", "utf-8");
        expect(loadJson(file)).toEqual({});
    });

    test("throw on invalid JSON", () => {
        const file = join(tmpDir, "invalid.json");
        writeFileSync(file, "not json", "utf-8");
        expect(() => loadJson(file)).toThrow();
    });

    test("throw on non-existent file", () => {
        expect(() => loadJson(join(tmpDir, "nope.json"))).toThrow();
    });
});

describe("loadJsonAsync", () => {
    test("load valid JSON", async() => {
        const file = join(tmpDir, "data.json");
        writeFileSync(file, "{\"async\":true}", "utf-8");
        expect(await loadJsonAsync(file)).toEqual({ async: true });
    });

    test("return empty object for empty file", async() => {
        const file = join(tmpDir, "empty.json");
        writeFileSync(file, "", "utf-8");
        expect(await loadJsonAsync(file)).toEqual({});
    });

    test("return empty object for whitespace-only file", async() => {
        const file = join(tmpDir, "whitespace.json");
        await writeFile(file, "   \n  ", "utf-8");
        expect(await loadJsonAsync(file)).toEqual({});
    });

    test("throw on invalid JSON", async() => {
        const file = join(tmpDir, "invalid.json");
        writeFileSync(file, "not json", "utf-8");
        await expect(loadJsonAsync(file)).rejects.toThrow();
    });

    test("throw on non-existent file", async() => {
        await expect(loadJsonAsync(join(tmpDir, "nope.json"))).rejects.toThrow();
    });
});

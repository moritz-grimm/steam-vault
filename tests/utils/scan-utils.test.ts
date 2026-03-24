import { scanForScreenshotFolders, scanForScreenshots } from "src/utils/scan-utils";
import { describe, expect, test, vi } from "vitest";
import { readdir } from "node:fs/promises";

vi.mock("node:fs/promises", () => ({
    readdir: vi.fn(),
}));

describe("scanForScreenshotFolders", () => {
    test("throw on empty path", async() => {
        const dirPath = "";
        await expect(() => scanForScreenshotFolders(dirPath)).rejects.toThrow();
    });

    test("throw on relative path", async() => {
        const dirPath = "path/to/folder";
        await expect(() => scanForScreenshotFolders(dirPath)).rejects.toThrow("Path must be absolute");
    });

    test("return only directory names", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
            { name: "123456", isDirectory: (): boolean => true },
            { name: "92485233", isDirectory: (): boolean => true },
            { name: "scan-utils.test.ts", isDirectory: (): boolean => false },
        ]);

        const result = await scanForScreenshotFolders(String.raw`c:\Steam\screnshots`);
        expect(result).toEqual(["123456", "92485233"]);
    });

    test("return empty array for empty directory", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const result = await scanForScreenshotFolders(String.raw`c:\Steam\screenshots`);
        expect(result).toEqual([]);
    });

    test("return empty array when no directories exist", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
            { name: "string-utils.ts", isDirectory: (): boolean => false },
            { name: "notes.txt", isDirectory: (): boolean => false },
            { name: "scan-utils.test.ts", isDirectory: (): boolean => false },
        ]);

        const result = await scanForScreenshotFolders(String.raw`c:\Steam\screenshots`);
        expect(result).toEqual([]);
    });
});

describe("scanForScreenshots", () => {
    test("throw on empty basePath", async() => {
        const basePath = "";
        const gameId = "730";

        await expect(() => scanForScreenshots(basePath, gameId)).rejects.toThrow();
    });

    test("throw on empty gameId", async() => {
        const basePath = String.raw`c:\Steam\screenshots`;
        const gameId = "";

        await expect(() => scanForScreenshots(basePath, gameId)).rejects.toThrow("Game ID must not be empty");
    });

    test("throw on relative basePath", async() => {
        const relativePath = "Steam/screenshots";
        const gameId = "730";

        await expect(() => scanForScreenshots(relativePath, gameId)).rejects.toThrow("Path must be absolute");
    });

    test("return only png, jpg, and jpeg files", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
            "20251012161723_1.png",
            "20250505212220_1.jpg",
            "20250308104615_1.jpeg",
            "scan-utils.test.ts",
            "notes.txt",
        ]);

        const result = await scanForScreenshots(String.raw`c:\Steam\screenshots`, "1172620");
        expect(result).toEqual(["20251012161723_1.png", "20250505212220_1.jpg", "20250308104615_1.jpeg"]);
    });

    test("match file extensions case-insensitively", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
            "20251012161723_1.PNG",
            "20250505212220_1.JPG",
            "20250308104615_1.JPEG",
        ]);

        const result = await scanForScreenshots(String.raw`c:\Steam\screenshots`, "1172620");
        expect(result).toEqual(["20251012161723_1.PNG", "20250505212220_1.JPG", "20250308104615_1.JPEG"]);
    });

    test("return empty array for empty directory", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const result = await scanForScreenshots(String.raw`c:\Steam\screenshots`, "1172620");
        expect(result).toEqual([]);
    });

    test("return empty array when no images exist", async() => {
        (readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
            "scan-utils.test.ts",
            "notes.txt",
            "string-utils.ts",
        ]);

        const result = await scanForScreenshots(String.raw`c:\Steam\screenshots`, "1172620");
        expect(result).toEqual([]);
    });
});

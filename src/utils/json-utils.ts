import { readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

export function writeToJson(filePath: string, content: unknown): void {
    writeFileSync(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export async function writeToJsonAsync(filePath: string, content: unknown): Promise<void> {
    await writeFile(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export function loadJson(filepath: string): unknown {
    const data = readFileSync(filepath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

export async function loadJsonAsync(filepath: string): Promise<unknown> {
    const data = await readFile(filepath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

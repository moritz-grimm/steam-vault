import { readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

export function writeToJson(filePath: string, content: unknown): void {
    writeFileSync(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export async function writeToJsonAsync(filePath: string, content: unknown): Promise<void> {
    await writeFile(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export function loadJson(filePath: string): unknown {
    const data = readFileSync(filePath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

export async function loadJsonAsync(filePath: string): Promise<unknown> {
    const data = await readFile(filePath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

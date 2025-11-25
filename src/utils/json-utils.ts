import fs from "node:fs";
import fsAsync from "node:fs/promises";

export function writeToJson(filePath: string, content: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export async function writeToJsonAsync(filePath: string, content: unknown): Promise<void> {
    await fsAsync.writeFile(filePath, JSON.stringify(content, null, 4), "utf-8");
}

export function loadJson(filepath: string): unknown {
    const data = fs.readFileSync(filepath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

export async function loadJsonAsync(filepath: string): Promise<unknown> {
    const data = await fsAsync.readFile(filepath, "utf-8");

    if (data.trim() === "") {
        return {};
    }

    return JSON.parse(data) as unknown;
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

export function getDirname(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return __dirname;
}

/**
 * Validates if the givcen path is an existing directory
 * @param directoryPath A absolute or relative directory path
 * @returns true if valid, error message otherwise
 */
export function isValidDirectory(directoryPath: string): string | true {
    try {
        const absolutePath = path.resolve(directoryPath);

        return fs.statSync(absolutePath).isDirectory() || "The path must be a directory";
    } catch {
        return "Path does not exist";
    }
}

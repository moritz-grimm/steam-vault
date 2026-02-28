import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Returns the absolute path of the directory in which the current module file is located.
 *
 * This function replicates the CommonJS `__dirname` behavior in an ES module context
 * by using `import.meta.url` and converting it to a file path.
 *
 * @example
 * // Example usage:
 * console.log(getDirname());
 * // Output: "C:/Users/admin/projects/steam-vault/src/utils"
 *
 * @returns {string} The absolute directory path of the current module file.
 */
export function getDirname(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return __dirname;
}

/**
 * Validates if the given path is an existing directory
 * @param directoryPath A absolute or relative directory path
 * @returns true if valid, error message otherwise
 */
export function isValidDirectory(directoryPath: string): string | true {
    try {
        const cleanedPath = path.normalize(directoryPath.trim());
        const absolutePath = path.resolve(cleanedPath);

        return fs.statSync(absolutePath).isDirectory() || "The path must be a directory";
    } catch {
        return "Path does not exist";
    }
}

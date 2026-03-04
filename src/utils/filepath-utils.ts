import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ValidationResult =
    | { valid: true }
    | { valid: false; reason: string };

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
export function isValidDirectory(directoryPath: string): ValidationResult {
    try {
        const cleanedPath = path.normalize(directoryPath.trim());
        const absolutePath = path.resolve(cleanedPath);

        if (fs.statSync(absolutePath).isDirectory()) {
            return { valid: true };
        }

        return { valid: false, reason: "Path is not a directory" };
    } catch {
        return { valid: false, reason: "Path does not exist" };
    }
}

export function isValidOneDriveFolderName(name: string): ValidationResult {
    if (!name) return { valid: false, reason: "Name cannot be empty" };
    if (name.length > 400) return { valid: false, reason: "Name can only be up to 400 characters long" };
    if (/["*:<>?/\\|]/.test(name)) return { valid: false, reason: String.raw`Name contains invalid characters: " * : < > ? / \ |` };
    if (/^(\.lock|CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name)) return { valid: false, reason: "Name is a reserved system name" };
    if (/^[~$.]/.test(name)) return { valid: false, reason: "Name cannot begin with ~, $ or ." };
    if (/[. ]$/.test(name)) return { valid: false, reason: "Name cannot end with a period or space" };
    return { valid: true };
}

/**
 * Returns the path to the screenshots folder for a given game.
 *
 * @param basePath - Root Steam screenshot directory (e.g. `config.screenshotDirectory`)
 * @param gameId - Steam game ID
 * @returns Absolute path to the game's screenshots folder
 */
export function getScreenshotFolder(basePath: string, gameId: string): string {
    return `${basePath}/${gameId}/screenshots`;
}

/**
 * Returns the full path to a specific screenshot file.
 *
 * @param basePath - Root Steam screenshot directory (e.g. `config.screenshotDirectory`)
 * @param gameId - Steam game ID
 * @param filename - Screenshot filename including extension (e.g. `"20240101120000_1.jpg"`)
 * @returns Absolute path to the screenshot file
 */
export function getScreenshotPath(basePath: string, gameId: string, filename: string): string {
    return `${getScreenshotFolder(basePath, gameId)}/${filename}`;
}

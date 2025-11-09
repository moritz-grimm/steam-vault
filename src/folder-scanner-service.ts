import fs from "node:fs/promises";
import path from "node:path";

/**
 * Scans a given parent Steam screenshot folder and returns the names of all immediate subfolders.
 * Each subfolder typically corresponds to a specific game.
 *
 * @param {string} folderpath - Absolute or relative path to the Steam parent screenshot folder.
 * @returns {Promise<string[]>} A promise that resolves to an array of folder names (strings) found inside the parent folder.
 *
 * @throws {Error} Throws an error if the folder does not exist or is not accessible.
 *
 * @example
 * const folders = await scanForScreenshotFolders("C:/Users/Username/Documents/SteamScreenshots");
 * console.log(folders); // ["Game1", "Game2", "Game3"]
 */
export async function scanForScreenshotFolders(folderpath: string): Promise<Array<string>> {
    if (!path.isAbsolute(folderpath)) {
        throw new Error("Path must be absolute");
    }
    const entries = await fs.readdir(folderpath, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
};

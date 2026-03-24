import { readdir } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { getScreenshotFolder } from "src/utils/filepath-utils";

/**
 * Scans a given parent Steam screenshot folder and returns the names of all immediate subfolders.
 * Each subfolder typically corresponds to a specific game.
 *
 * @param {string} directory - Absolute path to the Steam parent screenshot directory.
 * @returns {Promise<string[]>} A promise that resolves to an array of folder names (strings) found inside the parent directory.
 *
 * @throws {Error} Throws an error if the folder does not exist or is not accessible.
 *
 * @example
 * const folders = await scanForScreenshotFolders("C:/Users/Username/Documents/SteamScreenshots");
 * console.log(folders); // ["Game1", "Game2", "Game3"]
 */
export async function scanForScreenshotFolders(directory: string): Promise<Array<string>> {
    if (!isAbsolute(directory)) {
        throw new Error("Path must be absolute");
    }
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
};

/**
 * Scans a game's screenshot folder and returns filenames of all image files (png, jpg, jpeg).
 *
 * @param {string} basePath - Absolute path to the Steam parent screenshot directory.
 * @param {string} gameId - Steam game ID identifying the subfolder to scan.
 * @returns {Promise<string[]>} A promise that resolves to an array of image filenames found inside the game's screenshot folder.
 *
 * @throws {Error} Throws if basePath is not absolute, gameId is empty, or the folder is not accessible.
 */
export async function scanForScreenshots(basePath: string, gameId: string): Promise<Array<string>> {
    if (!isAbsolute(basePath)) {
        throw new Error("Path must be absolute");
    }
    if (!gameId) {
        throw new Error("Game ID must not be empty");
    }

    const directory = getScreenshotFolder(basePath, gameId);

    const files = await readdir(directory);
    return files.filter(file => /\.(png|jpg|jpeg)$/i.test(file));
}

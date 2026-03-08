import { Dirent, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readRegistryValue } from "src/utils/registry-utils";

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
    const __dirname = dirname(__filename);

    return __dirname;
}

/**
 * Validates if the given path is an existing directory
 * @param directoryPath A absolute or relative directory path
 * @returns true if valid, error message otherwise
 */
export function isValidDirectory(directoryPath: string): ValidationResult {
    try {
        const cleanedPath = normalize(directoryPath.trim());
        const absolutePath = resolve(cleanedPath);

        if (statSync(absolutePath).isDirectory()) {
            return { valid: true };
        }

        return { valid: false, reason: "Path is not a directory" };
    } catch {
        return { valid: false, reason: "Path does not exist" };
    }
}

const USERDATA_SCREENSHOT_SUFFIX = "760/remote";

const FALLBACK_STEAM_PATHS = [
    "C:/Program Files (x86)/Steam",
    "C:/Program Files/Steam",
    "D:/Steam",
    "D:/SteamLibrary",
];

/**
 * Attempts to auto-detect the Steam screenshot directory.
 *
 * 1. Reads the Steam install path from the Windows registry
 * 2. Falls back to common default installation paths
 * 3. For each candidate, scans `userdata/{userId}/760/remote` and validates
 *
 * @returns The first valid screenshot directory path, or null if none found
 */
export async function detectSteamScreenshotPath(): Promise<string | null> {
    const registryPath = await readRegistryValue("HKCU", String.raw`Software\Valve\Steam`, "SteamPath");

    const candidates = registryPath ? [registryPath, ...FALLBACK_STEAM_PATHS.filter(p => resolve(p) !== resolve(registryPath))] : FALLBACK_STEAM_PATHS;

    for (const steamRoot of candidates) {
        const result = findScreenshotPathInSteamRoot(steamRoot);
        if (result) return result;
    }

    return null;
}

/**
 * Scans a Steam root directory for valid screenshot paths under `userdata/{userId}/760/remote`.
 * @returns The first valid path found, or null.
 */
function findScreenshotPathInSteamRoot(steamRoot: string): string | null {
    const userdataPath = join(steamRoot, "userdata");

    let userFolders: Dirent[];
    try {
        userFolders = readdirSync(userdataPath, { withFileTypes: true });
    } catch {
        return null;
    }

    for (const folder of userFolders) {
        if (!folder.isDirectory() || !/^\d+$/.test(folder.name)) continue;

        const screenshotRoot = join(userdataPath, folder.name, USERDATA_SCREENSHOT_SUFFIX);
        const normalized = screenshotRoot.split(/[\\/]/).join("/");

        if (isSteamScreenshotDirectory(normalized).valid) {
            return normalized;
        }
    }

    return null;
}

/**
 * Validates whether a directory looks like a Steam screenshot root directory.
 * Expects the `760/remote` level: contains numeric gameId subfolders,
 * where at least one has a `screenshots` subdirectory.
 */
export function isSteamScreenshotDirectory(directoryPath: string): ValidationResult {
    const dirResult = isValidDirectory(directoryPath);
    if (!dirResult.valid) return dirResult;

    const absolutePath = resolve(normalize(directoryPath.trim()));

    let entries: Dirent[];
    try {
        entries = readdirSync(absolutePath, { withFileTypes: true });
    } catch {
        return { valid: false, reason: "Cannot read directory" };
    }

    const gameIdFolders = entries.filter(e => e.isDirectory() && /^\d+$/.test(e.name));
    if (gameIdFolders.length === 0) {
        return { valid: false, reason: "No numeric game ID folders found" };
    }

    const hasScreenshotsSubfolder = gameIdFolders.some(folder => {
        const screenshotsPath = join(absolutePath, folder.name, "screenshots");
        try {
            return statSync(screenshotsPath).isDirectory();
        } catch {
            return false;
        }
    });

    if (!hasScreenshotsSubfolder) {
        return { valid: false, reason: "No game folder contains a 'screenshots' subdirectory" };
    }

    return { valid: true };
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

export function getAppDataPath(): string {
    const appData = process.env.APPDATA;
    if (!appData) {
        throw new Error("APPDATA environment variable is not set. SteamVault requires Windows with APPDATA to work");
    }
    return appData;
}

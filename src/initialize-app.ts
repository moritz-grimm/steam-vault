import path from "node:path";
import fs from "node:fs/promises";
import { loadConfigs, settingsConfigPath, SteamVaultConfig } from "src/config-service";
import { writeToJsonAsync } from "src/utils/json-utils";
import { loginToMicrosoft } from "src/auth/ms-auth";

const appDataFolder = path.resolve(process.env.APPDATA || "", "SteamVault");
const backupPath = path.resolve(appDataFolder, "/backup");

const defaultConfig: SteamVaultConfig = {
    screenshotFolderPath: "C:/Program Files (x86)/Steam/userdata/906825544/760/remote",
    gameTitleCache: "%APPDATA%/SteamVault/gametitle-cache.json",
    screenshotHashes: "%APPDATA%/SteamVault/screenshot-hashes.json",
    entraClientId: "1cb15360-f199-4b94-94de-557b82824079",
    msalCache: "%APPDATA%/SteamVault/msal-cache.json",
    logDirPath: "%APPDATA%/SteamVault/logs",
    backupPath: "%APPDATA%/SteamVault/backup",
};


/**
 * Initializes the SteamVault application on startup.
 *
 * This function performs the following steps:
 * 1. Creates the AppData folder for SteamVault if it doesn't exist yet
 * 2. Loads all configuration files (e.g., screenshot paths, caches)
 * 3. Executes the Microsoft login flow
 * 4. Creates a default configuration file (steamvault-config.json) if none exists
 *
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 * @throws {Error} May throw errors during directory creation, config loading, or MS authentication
 */
export async function initializeApp(): Promise<void> {
    await fs.mkdir(appDataFolder, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });
    await loadConfigs();
    await loginToMicrosoft();

    try {
        await fs.access(settingsConfigPath);
    } catch {
        await writeToJsonAsync(settingsConfigPath, defaultConfig);
    }
}

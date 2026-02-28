import fs from "node:fs/promises";
import path from "node:path";
import { OneDriveService } from "src/api/onedrive-service";
import { SteamApiService } from "src/api/steam-api-service";
import { AppContext } from "src/app-context";
import { AuthService } from "src/auth/ms-auth";
import { BackupService } from "src/backup-service";
import { parseCLIArgs } from "src/cli/cli-parser";
import { ConfigService, settingsConfigPath, SteamVaultConfig } from "src/config-service";
import { HashService } from "src/hash-service";
import { writeToJsonAsync } from "src/utils/json-utils";
import { createAppLogger } from "src/utils/logger";
import { GameTitleCache } from "./api/game-title-cache";

const appDataFolder = path.resolve(process.env.APPDATA || "", "SteamVault");
const backupPath = path.resolve(appDataFolder, "/backup");

const defaultConfig: SteamVaultConfig = {
    // screenshotFolderPath: "C:/Program Files (x86)/Steam/userdata/906825544/760/remote",
    screenshotFolderPath: "", //TODO: If empty ask user for a path
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
 * 2. Ensures a default config file exists
 * 3. Loads all configuration via ConfigService
 * 4. Executes the Microsoft login flow
 *
 * @returns {Promise<AppContext>} The application context with config, CLI options, and logger
 * @throws {Error} May throw errors during directory creation, config loading, or MS authentication
 */
export async function initializeApp(): Promise<AppContext> {
    await fs.mkdir(appDataFolder, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });

    try {
        await fs.access(settingsConfigPath);
    } catch {
        await writeToJsonAsync(settingsConfigPath, defaultConfig);
    }

    const cliOptions = parseCLIArgs();
    const configService = await ConfigService.create();
    const logger = createAppLogger();
    logger.info("CLI options:", cliOptions);
    const gameTitleCache = new GameTitleCache(configService, logger);

    const authService = new AuthService(configService, logger);
    const hashService = new HashService(configService, logger);
    const onedriveService = new OneDriveService(configService, logger, authService);
    const steamApiService = new SteamApiService(logger, gameTitleCache);
    const backupService = new BackupService(configService, logger, steamApiService, hashService, onedriveService);

    await authService.login();

    return { configService, authService, cliOptions, backupService };
}

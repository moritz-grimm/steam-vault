import { resolve } from "node:path";
import { getAppDataPath } from "src/utils/filepath-utils";
import { loadJsonAsync, writeToJsonAsync } from "src/utils/json-utils";
import { toError } from "./utils/error-utils";

export const configPath = resolve(getAppDataPath(), "SteamVault/steamvault.config.json");

export type SteamVaultConfig = {
    screenshotDirectory: string,
    gameTitleCache: string,
    screenshotHashes: string,
    entraClientId: string,
    msalCache: string,
    logDirPath: string,
    backupPath: string,
    oneDriveRootPath: string,
    oneDriveBaseFolder: string,
};

// This needs to be passed around as the service and not just a snapshot of the config file to ensure configFile is always up to date
export class ConfigService {
    private config: SteamVaultConfig;

    private constructor(config: SteamVaultConfig) {
        this.config = config;
    }

    private static resolveConfigPlaceholders(configString: string): string {
        return configString
            .replaceAll("%APPDATA%", getAppDataPath());
    }

    private static async load(): Promise<SteamVaultConfig> {
        try {
            const config = await loadJsonAsync(configPath) as SteamVaultConfig;

            for (const key of Object.keys(config) as (keyof SteamVaultConfig)[]) {
                const value = config[key];
                if (typeof value === "string") {
                    config[key] = ConfigService.resolveConfigPlaceholders(value);
                }
            }

            return config;
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Could not load steamvault.config.json: ${error.message}`);
        }
    }

    /**
     * Factory method that loads the config from disk and returns a ready-to-use ConfigService.
     * Resolves path placeholders (e.g. `%APPDATA%`) in all string values.
     * @throws If the config file cannot be read or parsed.
     */
    public static async create(): Promise<ConfigService> {
        const config = await ConfigService.load();
        return new ConfigService(config);
    }

    private async reload(): Promise<void> {
        this.config = await ConfigService.load();
    }

    /** Returns the current in-memory config snapshot. */
    public get(): SteamVaultConfig {
        return this.config;
    }

    /**
     * Updates a single config key, persists to disk, and reloads.
     * @param jsonKey - The config property to update.
     * @param newValue - The new value to set.
     * @throws If the config file cannot be written.
     */
    public async write(jsonKey: keyof SteamVaultConfig, newValue: string): Promise<void> {
        this.config[jsonKey] = newValue;

        try {
            await writeToJsonAsync(configPath, this.config);
            await this.reload();
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Could not write to steamvault-config.json: ${error.message}`);
        }
    }
}

import fs from "node:fs/promises";
import path from "node:path";
import { loadJsonAsync } from "src/utils/json-utils";
import { toError } from "./utils/error-utils";

export const configPath = path.resolve(process.env.APPDATA || "", "SteamVault/steamvault.config.json");

export type SteamVaultConfig = {
    screenshotFolderPath: string,
    gameTitleCache: string,
    screenshotHashes: string,
    entraClientId: string,
    msalCache: string,
    logDirPath: string,
    backupPath: string,
};

// This needs to be passed around as the service and not just a snapshot of the config file to ensure configFile is always up to date
export class ConfigService {
    private config: SteamVaultConfig;

    private constructor(config: SteamVaultConfig) {
        this.config = config;
    }

    private static resolveConfigPlaceholders(configString: string): string {
        return configString
            .replaceAll("%APPDATA%", process.env.APPDATA || "");
    }

    private static async loadFromDisk(): Promise<SteamVaultConfig> {
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

    public static async create(): Promise<ConfigService> {
        const config = await ConfigService.loadFromDisk();
        return new ConfigService(config);
    }

    private async reload(): Promise<void> {
        this.config = await ConfigService.loadFromDisk();
    }

    public get(): SteamVaultConfig {
        return this.config;
    }

    public async write(jsonKey: keyof SteamVaultConfig, newValue: string): Promise<void> {
        this.config[jsonKey] = newValue;

        try {
            await fs.writeFile(configPath, JSON.stringify(this.config, null, 2), "utf-8");
            await this.reload();
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Could not write to steamvault-config.json: ${error.message}`);
        }
    }
}

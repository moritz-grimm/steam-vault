import fs from "node:fs/promises";
import path from "node:path";
import { toError } from "./utils/error-utils";
import { CliOptions, parseCLIArgs } from "src/cli/cli-parser";
import { loadJsonAsync } from "src/utils/json-utils";

export const settingsConfigPath = path.resolve(process.env.APPDATA || "", "SteamVault/steamvault-config.json");

export type SteamVaultConfig = {
    screenshotFolderPath: string,
    gameTitleCache: string,
    screenshotHashes: string,
    entraClientId: string,
    msalCache: string,
    logDirPath: string,
    backupPath: string,
};

function resolveConfigPlaceholders(configString: string): string {
    return configString
        .replaceAll("%APPDATA%", process.env.APPDATA || "");
}

async function loadFromDisk(): Promise<SteamVaultConfig> {
    try {
        const config = await loadJsonAsync(settingsConfigPath) as SteamVaultConfig;

        for (const key of Object.keys(config) as (keyof SteamVaultConfig)[]) {
            const value = config[key];
            if (typeof value === "string") {
                config[key] = resolveConfigPlaceholders(value);
            }
        }

        return config;
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error(`Could not load steamvault-config.json: ${error.message}`);
    }
}

// ──────────────────────────────────────────────
// ConfigService
// ──────────────────────────────────────────────
// This needs to be passed around as the service and not just a snapshot of the config file to ensure configFile is always up to date
export class ConfigService {
    private config: SteamVaultConfig;

    private constructor(config: SteamVaultConfig) {
        this.config = config;
    }

    static async create(): Promise<ConfigService> {
        const config = await loadFromDisk();
        return new ConfigService(config);
    }

    get(): SteamVaultConfig {
        return this.config;
    }

    private async reload(): Promise<void> {
        this.config = await loadFromDisk();
    }

    async write(jsonKey: keyof SteamVaultConfig, newValue: string): Promise<void> {
        this.config[jsonKey] = newValue;

        try {
            await fs.writeFile(settingsConfigPath, JSON.stringify(this.config, null, 2), "utf-8");
            await this.reload();
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Could not write to steamvault-config.json: ${error.message}`);
        }
    }
}

// ──────────────────────────────────────────────
// Legacy singleton - remove when all services are refactored
// ──────────────────────────────────────────────
type Config = {
    settings: SteamVaultConfig;
    cli: CliOptions;
};

let configCache: Config | null = null;

/** @deprecated Use ConfigService.create() + ConfigService.get() */
export async function loadSettingsConfig(): Promise<SteamVaultConfig> {
    return loadFromDisk();
}

/** @deprecated Use ConfigService.write() */
export async function writeToSettingsConfig(jsonKey: keyof SteamVaultConfig, newValue: string): Promise<void> {
    try {
        const fileData = await loadSettingsConfig();

        fileData[jsonKey] = newValue;

        await fs.writeFile(settingsConfigPath, JSON.stringify(fileData, null, 2), "utf-8");
        await loadConfigs();
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not write to steamvault-config.json", error);
    }
}

/** @deprecated Remove when singleton is fully replaced */
export async function loadConfigs(): Promise<void> {
    configCache = {
        settings: await loadSettingsConfig(),
        cli: parseCLIArgs(),
    };
}

/** @deprecated Use ConfigService.get() */
export function getConfig(): Config {
    if (!configCache) {
        throw new Error("Config not loaded! Call loadConfig() first.");
    }
    return configCache;
}

/** @deprecated Use ConfigService.get() */
export function getSettingsConfig(): SteamVaultConfig {
    return getConfig().settings;
}

/** @deprecated Use parseCLIArgs() directly */
export function getCliConfig(): CliOptions {
    return getConfig().cli;
}

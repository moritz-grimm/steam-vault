import fs from "node:fs/promises";
import path from "node:path";
import { toError } from "./utils/error-utils";
import { CliOptions, parseCLIArgs } from "src/cli/cli-parser";
import { loadJsonAsync } from "src/utils/json-utils";

export const settingsConfigPath = path.resolve(process.env.APPDATA || "", "SteamVault/steamvault-config.json");

let configCache: Config | null = null;

export type SteamVaultConfig = {
    screenshotFolderPath: string,
    gameTitleCache: string,
    screenshotHashes: string,
    entraClientId: string,
    msalCache: string,
    logDirPath: string,
};

type Config = {
    settings: SteamVaultConfig;
    cli: CliOptions;
};

/**
 * Load application settings configuration from disk.
 *
 * Reads the file at `steamvault-config.json`,
 * parses it as JSON and returns a typed SettingsConfig object.
 *
 * @throws An error if the file cannot be read or the JSON is invalid.
 *
 * @returns {Promise<SteamVaultConfig>} Parsed configuration object.
 */
export async function loadSettingsConfig(): Promise<SteamVaultConfig> {
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

/**
 * Write to the settings configuration
 * @param jsonKey The key to be replaced or created
 * @param newValue The value of the previous given key
 */
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

function resolveConfigPlaceholders(configString: string): string {
    return configString
        .replaceAll("%APPDATA%", process.env.APPDATA || "");
}

/**
 * Load the cli, settings & auth configs into cache. This needs to be called on start and everytime something changes on runtime to ensure correct data
 */
export async function loadConfigs(): Promise<void> {
    configCache = {
        settings: await loadSettingsConfig(),
        cli: parseCLIArgs(),
    };
}

export function getConfig(): Config {
    if (!configCache) {
        throw new Error("Config not loaded! Call loadConfig() first.");
    }
    return configCache;
}

export function getSettingsConfig(): SteamVaultConfig {
    return getConfig().settings;
}

export function getCliConfig(): CliOptions {
    return getConfig().cli;
}

import fs from "node:fs/promises";
import path from "node:path";
import { getDirname } from "./utils/filepath-utils";
import { toError } from "./utils/error-utils";
import { CliOptions, parseCLIArgs } from "src/cli/cli-parser";

// TODO: Relocate config to appData or somewhere similar
const settingsConfigPath = path.resolve(getDirname(), "../../steamvault-config.json");
const authConfigPath = path.resolve(getDirname(), "../../auth-config.json");

let configCache: Config | null = null;

type SettingsConfig = {
    folderpath: string
};

type AuthConfig = {
    entraClientId: string
};

type Config = {
    settings: SettingsConfig;
    cli: CliOptions;
    auth: AuthConfig,
};

/**
 * Load application settings configuration from disk.
 *
 * Reads the file at `steamvault-config.json`,
 * parses it as JSON and returns a typed SettingsConfig object.
 *
 * @throws An error if the file cannot be read or the JSON is invalid.
 *
 * @returns {Promise<SettingsConfig>} Parsed configuration object.
 */
export async function loadSettingsConfig(): Promise<SettingsConfig> {
    try {
        const data = await fs.readFile(settingsConfigPath, "utf-8");
        return JSON.parse(data) as SettingsConfig;
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not load steamvault-config.json", error);
    }
}

/**
 * Write to the settings configuration
 * @param jsonKey The key to be replaced or created
 * @param newValue The value of the previous given key
 */
export async function writeToSettingsConfig(jsonKey: keyof SettingsConfig, newValue: string): Promise<void> {
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

/**
 * Reads the auth config from disk
 *
 * Reads the file at `auth-config.json`,
 * parses it as JSON and returns a typed JsonConfig object.
 *
 * @throws An error if the file cannot be read or the JSON is invalid.
 *
 * @returns {Promise<AuthConfig>} Parsed configuration object.
 */
export async function loadAuthConfig(): Promise<AuthConfig> {
    try {
        const data = await fs.readFile(authConfigPath, "utf-8");
        return JSON.parse(data) as AuthConfig;
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not load auth-config.sjon", error);
    }
}

/**
 * Load the cli and json configs into cache. This needs to be called on start and everytime something changes on runtime to ensure correct data
 */
export async function loadConfigs(): Promise<void> {
    configCache = {
        settings: await loadSettingsConfig(),
        cli: parseCLIArgs(),
        auth: await loadAuthConfig(),
    };
}

export function getConfig(): Config {
    if (!configCache) {
        throw new Error("Config not loaded! Call loadConfig() first.");
    }
    return configCache;
}

export function getSettingsConfig(): SettingsConfig {
    return getConfig().settings;
}

export function getCliConfig(): CliOptions {
    return getConfig().cli;
}

export function getAuthConfig(): AuthConfig {
    return getConfig().auth;
}

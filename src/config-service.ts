import fs from "node:fs/promises";
import path from "node:path";
import { getDirname } from "./utils/filepath-utils";
import { toError } from "./utils/error-utils";
import { CliOptions, parseCLIArgs } from "src/cli/cli-parser";

// TODO: Relocate config to appData or somewhere similar
const jsonConfigPath = path.resolve(getDirname(), "../../steamvault-config.json");

let configCache: Config | null = null;

type JsonConfig = {
    folderpath: string
};

type Config = {
    json: JsonConfig;
    cli: CliOptions;
};

/**
 * Load application JSON configuration from disk.
 *
 * Reads the file at `steamvault-config.json` (atp relative to this module. In the future it should point to a config stored somewhere in appdata),
 * parses it as JSON and returns a typed JsonConfig object.
 *
 * @throws An error if the file cannot be read or the JSON is invalid.
 *
 * @returns {Promise<JsonConfig>} Parsed configuration object.
 */
export async function loadJsonConfig(): Promise<JsonConfig> {
    try {
        const data = await fs.readFile(jsonConfigPath, "utf-8");
        return JSON.parse(data) as JsonConfig;
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not load steamvault-config.json", error);
    }
}

/**
 * Write to the JSON configuration
 * @param jsonKey The key to be replaced or created
 * @param newValue The value of the previous given key
 */
export async function writeToJsonConfig(jsonKey: keyof JsonConfig, newValue: string): Promise<void> {
    try {
        const fileData = await loadJsonConfig();

        fileData[jsonKey] = newValue;

        await fs.writeFile(jsonConfigPath, JSON.stringify(fileData, null, 2), "utf-8");
        await loadConfigs();
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not write to steamvault-config.json", error);
    }
}

/**
 * Load the cli and json configs into cache. This needs to be called on start and everytime something changes on runtime to ensure correct data
 */
export async function loadConfigs(): Promise<void> {
    configCache = {
        json: await loadJsonConfig(),
        cli: parseCLIArgs(),
    };
}

export function getConfig(): Config {
    if (!configCache) {
        throw new Error("Config not loaded! Call loadConfig() first.");
    }
    return configCache;
}

export function getJsonConfig(): JsonConfig {
    return getConfig().json;
}

export function getCliConfig(): CliOptions {
    return getConfig().cli;
}

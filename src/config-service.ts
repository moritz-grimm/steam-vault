import fs from "node:fs/promises";
import path from "node:path";
import { getDirname } from "./utils/filepath-utils";
import { toError } from "./utils/error-utils";

// TODO: Relocate config to appDate or somewhere similar
const jsonConfigPath = path.resolve(getDirname(), "../../steamvault-config.json");

type JsonConfig = {
    folderpath: string
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
    // TODO: This can fail if its the first app start. Add a jsonConfig init
    try {
        const data = await fs.readFile(jsonConfigPath, "utf-8");
        return JSON.parse(data) as JsonConfig;
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not load steamvault-config.json", error);
    }
}

export async function writeToJsonConfig(jsonKey: keyof JsonConfig, newValue: string): Promise<void> {
    try {
        const fileData = await loadJsonConfig();

        fileData[jsonKey] = newValue;

        await fs.writeFile(jsonConfigPath, JSON.stringify(fileData, null, 2), "utf-8");
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Could not write to steamvault-config.json", error);
    }
}

import fs from "node:fs";
import crypto from "node:crypto";
import { loadJson, writeToJson } from "src/utils/json-utils";
import { logger } from "src/utils/logger";
import { toError } from "exiftool-vendored/dist/ErrorsAndWarnings";
import { getSettingsConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";

// TODO: Add comment telling to not modify this file
type GameHashes = {
    [gameId: string]: {
        [fileName: string]: string;
    };
};

// ──────────────────────────────────────────────
// Legacy exports - remove when all callers are refactored
// Used by: backup-service.ts
// ──────────────────────────────────────────────
/**
 * @deprecated Use HashService.hashScreenshot()
 */
export function hashScreenshot(gameId: string, screenshot: string): string {
    const filePath = `C:/Program Files (x86)/Steam/userdata/906825544/760/remote/${gameId}/screenshots/${screenshot}`;
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

/**
 * @deprecated Use HashService.hashExists()
 */
export function hashExists(screenshotHash: string, gameId: string, screenshotFileName: string): boolean {
    let hashes: GameHashes = {};

    if (fs.existsSync(getSettingsConfig().screenshotHashes)) {
        try {
            // TODO: Implement first comparing remote hash json to local json before doing the screenshot comparing
            // compareRemoteAndLocaleHashJson();
            hashes = loadJson(getSettingsConfig().screenshotHashes) as GameHashes;
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Error loading screenshot-hashes.json: ${error.message}`);
        }
    }

    for (const gId in hashes) {
        for (const fileName in hashes[gId]) {
            if (hashes[gId][fileName] === screenshotHash) {
                logger.log("info", "Screenshot found in 'screenshot-hashes.json'");
                return true;
            }
        }
    }

    if (!hashes[gameId]) {
        hashes[gameId] = {};
    }

    logger.log("info", "Screenshot not found. Writing to json");
    hashes[gameId][screenshotFileName] = screenshotHash;

    // TODO: If a upload fails. The hash is still written to the json. Fix this
    writeToJson(getSettingsConfig().screenshotHashes, hashes);

    return false;
}

/**
 * @deprecated Use HashService.compareRemoteAndLocaleHashJson()
 */
export function compareRemoteAndLocaleHashJson(): void {
    throw new NotImplementedException;
}

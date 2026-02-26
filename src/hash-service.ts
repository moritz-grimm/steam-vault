import fs from "node:fs";
import crypto from "node:crypto";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { loadJson, writeToJson } from "src/utils/json-utils";
import { Logger } from "winston";
import { toError } from "exiftool-vendored/dist/ErrorsAndWarnings";

// TODO: Add comment to file telling to not modify this file
type GameHashes = {
    [gameId: string]: {
        [fileName: string]: string;
    };
};

// ──────────────────────────────────────────────
// HashService
// ──────────────────────────────────────────────
export class HashService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    /**
     * Hashes a screenshot file using SHA-256 for comparison if the screenshot was already uploaded
     * @param {string} gameId - The Steam game ID corresponding to the game.
     * @param {string} screenshot - The filename of the screenshot to hash.
     * @returns {string} The SHA-256 hash of the screenshot as as hexadecimal string.
     *
     * @throws {Error} If the screenshot file cannot be read (e.g., does not exist or permission denied).
     */
    hashScreenshot(gameId: string, screenshot: string): string {
        const filePath = `C:/Program Files (x86)/Steam/userdata/906825544/760/remote/${gameId}/screenshots/${screenshot}`;
        const fileBuffer = fs.readFileSync(filePath);
        return crypto.createHash("sha256").update(fileBuffer).digest("hex");
    }

    /**
     * Returns true if the screenshot hash already exists, false otherwise.
     * If false, the hash is added to the JSON file.
     *
     * @param screenshotHash Hash of the screenshot to be uploaded
     * @param gameId Id of the game corresponding to the screenshot
     * @param screenshotFileName Filename of the screenshot to be uploaded
     */
    hashExists(screenshotHash: string, gameId: string, screenshotFileName: string): boolean {
        let hashes: GameHashes = {};

        if (fs.existsSync(this.config.screenshotHashes)) {
            try {
                // TODO: Implement first comparing remote hash json to local json before doing the screenshot comparing
                // compareRemoteAndLocaleHashJson();
                hashes = loadJson(this.config.screenshotHashes) as GameHashes;
            } catch (err: unknown) {
                const error = toError(err);
                throw new Error(`Error loading screenshot-hashes.json: ${error.message}`);
            }
        }

        for (const gId in hashes) {
            for (const fileName in hashes[gId]) {
                if (hashes[gId][fileName] === screenshotHash) {
                    this.logger.info("Screenshot found in 'screenshot-hashes.json'");
                    return true;
                }
            }
        }

        if (!hashes[gameId]) {
            hashes[gameId] = {};
        }

        this.logger.info("Screenshot not found. Writing to json");
        hashes[gameId][screenshotFileName] = screenshotHash;

        // TODO: If a upload fails. The hash is still written to the json. Fix this
        writeToJson(this.config.screenshotHashes, hashes);

        return false;
    }

    compareRemoteAndLocaleHashJson(): void {
        throw new NotImplementedException;
    }
}

import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { loadJsonAsync, writeToJsonAsync } from "src/utils/json-utils";
import { Logger } from "winston";

// TODO: Implement a cache
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
    public constructor(
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
    public async hashScreenshot(gameId: string, screenshot: string): Promise<string> {
        const filePath = `${this.config.screenshotFolderPath}/${gameId}/screenshots/${screenshot}`;
        const fileBuffer = await readFile(filePath);
        return crypto.createHash("sha256").update(fileBuffer).digest("hex");
    }

    /**
     * Returns true if the screenshot hash already exists, false otherwise.
     *
     * @param screenshotHash Hash of the screenshot to be checked
     */
    public async exists(screenshotHash: string): Promise<boolean> {
        let hashes: GameHashes = {};

        try {
            hashes = await loadJsonAsync(this.config.screenshotHashes) as GameHashes;
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") { // To prevent error logging on first start if there are no entries yet
                this.logger.error("Error loading screenshot-hashes.json", err);
            }
        }

        return Object.values(hashes).some(game =>
            Object.values(game).includes(screenshotHash),
        );
    }

    public async add(gameId: string, filename: string, screenshotHash: string): Promise<void> {
        let hashes: GameHashes = {};

        try {
            hashes = await loadJsonAsync(this.config.screenshotHashes) as GameHashes;
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") { // To prevent error logging on first start if there are no entries yet
                this.logger.error("Error loading screenshot-hashes.json", err);
            }
        }

        // Check already loaded file to avoid loading same file twice via .exists
        const alreadyExists = Object.values(hashes).some(game =>
            Object.values(game).includes(screenshotHash),
        );
        if (alreadyExists) return;

        if (!hashes[gameId]) {
            hashes[gameId] = {};
        }

        hashes[gameId][filename] = screenshotHash;

        await writeToJsonAsync(this.config.screenshotHashes, hashes);
    }

    compareRemoteAndLocaleHashJson(): void {
        throw new NotImplementedException;
    }
}

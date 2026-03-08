import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { toError } from "src/utils/error-utils";
import { getScreenshotPath } from "src/utils/filepath-utils";
import { loadJsonAsync, writeToJsonAsync } from "src/utils/json-utils";
import { Logger } from "winston";

// TODO: Add comment to file telling to not modify this file
type GameHashes = {
    [gameId: string]: {
        [fileName: string]: string;
    };
};

export class HashService {
    private hashes: GameHashes | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    private async load(): Promise<GameHashes> {
        if (this.hashes) return this.hashes;

        try {
            this.hashes = await loadJsonAsync(this.config.screenshotHashes) as GameHashes;
            return this.hashes;
        } catch (err: unknown) {
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
                throw new Error(`Could not load screenshot.hashes.json: ${toError(err).message}`);
            }
            this.hashes = {};
            return this.hashes;
        }
    }

    /**
     * Hashes a screenshot file using SHA-256 for comparison if the screenshot was already uploaded
     * @param {string} gameId - The Steam game ID corresponding to the game.
     * @param {string} filename - The filename of the screenshot to hash.
     * @returns {string} The SHA-256 hash of the screenshot as as hexadecimal string.
     *
     * @throws {Error} If the screenshot file cannot be read (e.g., does not exist or permission denied).
     */
    public async hashScreenshot(gameId: string, filename: string): Promise<string> {
        const filePath = getScreenshotPath(this.config.screenshotDirectory, gameId, filename);
        const fileBuffer = await readFile(filePath);
        return crypto.createHash("sha256").update(fileBuffer).digest("hex");
    }

    /**
     * Returns true if the screenshot hash already exists, false otherwise.
     *
     * @param screenshotHash Hash of the screenshot to be checked
     */
    public async exists(screenshotHash: string): Promise<boolean> {
        const hashes = await this.load();
        return Object.values(hashes).some(game =>
            Object.values(game).includes(screenshotHash),
        );
    }

    /**
     * Records a screenshot hash in the hash map and persists to disk.
     * No-op if the hash already exists.
     * @param gameId - Steam game ID.
     * @param filename - Screenshot filename.
     * @param screenshotHash - SHA-256 hex digest of the file.
     */
    public async add(gameId: string, filename: string, screenshotHash: string): Promise<void> {
        const hashes = await this.load();

        const alreadyExists = Object.values(hashes).some(game =>
            Object.values(game).includes(screenshotHash),
        );
        if (alreadyExists) return;

        if (!hashes[gameId]) {
            hashes[gameId] = {};
        }

        hashes[gameId][filename] = screenshotHash;

        await writeToJsonAsync(this.config.screenshotHashes, hashes);
        this.hashes = hashes;
        this.logger.info("Successfully wrote new screenshot hash to disk");
    }

    private compareRemoteAndLocaleHashJson(): void {
        throw new NotImplementedException;
    }
}

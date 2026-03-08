import { ConfigService, SteamVaultConfig } from "src/config-service";
import { loadJsonAsync, writeToJsonAsync } from "src/utils/json-utils";
import { Logger } from "winston";

type GameTitleMap = Record<string, string>;

export class GameTitleCache {
    private entries: GameTitleMap | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    private async loadFromDisk(): Promise<GameTitleMap> {
        if (this.entries) return this.entries;

        try {
            this.entries = await loadJsonAsync(this.config.gameTitleCache) as GameTitleMap;
            this.logger.info("Successfully loaded game title cache from disk");
            return this.entries;
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                this.logger.info("Game title cache not found on disk (first run). Starting with empty cache");
                this.entries = {};
                return this.entries;
            }
            throw err;
        }
    }

    /** Returns the cached game title for the given app ID, or `undefined` if not cached. */
    public async get(appId: string): Promise<string | undefined> {
        const entries = await this.loadFromDisk();
        return entries[appId];
    }

    /** Returns `true` if the cache contains an entry for the given app ID. */
    public async has(appId: string): Promise<boolean> {
        const entries = await this.loadFromDisk();
        return appId in entries;
    }

    /**
     * Adds or updates a game title in the cache and persists to disk.
     * @param appId - Steam application ID.
     * @param gameTitle - The resolved game title to cache.
     */
    public async set(appId: string, gameTitle: string): Promise<void> {
        const entries = await this.loadFromDisk();
        entries[appId] = gameTitle;

        await writeToJsonAsync(this.config.gameTitleCache, entries);
        this.logger.info("Successfully wrote new game title to disk");
        this.entries = entries;
    }
}

import fs from "node:fs/promises";
import { ConfigService, SteamVaultConfig } from "src/config-service";
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
            const data = await fs.readFile(this.config.gameTitleCache, "utf-8");
            this.entries = JSON.parse(data) as GameTitleMap;
            this.logger.info("Successfully loaded game title cache from disk");
            return this.entries;
        } catch {
            this.entries = {};
            return this.entries;
        }
    }

    async get(appId: string): Promise<string | undefined> {
        const entries = await this.loadFromDisk();
        return entries[appId];
    }

    async has(appId: string): Promise<boolean> {
        const entries = await this.loadFromDisk();
        return appId in entries;
    }

    async set(appId: string, gameTitle: string): Promise<void> {
        const entries = await this.loadFromDisk();
        entries[appId] = gameTitle;

        await fs.writeFile(this.config.gameTitleCache, JSON.stringify(entries, null, 2), "utf-8");
        this.logger.info("Successfully wrote new game title to disk");
        this.entries = entries;
    }
}

import axios from "axios";
import { GameTitleCache } from "src/api/game-title-cache";
import { toError } from "src/utils/error-utils";
import { Logger } from "winston";

type SteamApiResponse = {
    [appId: string]: {
        success: boolean,
        data: {
            name: string,
        }
    }
};

export class SteamApiService {
    constructor(
        private readonly logger: Logger,
        private readonly gameTitleCache: GameTitleCache,
    ) {}

    /**
     * Resolves a Steam app ID to its game title. Returns a cached value if available,
     * otherwise fetches from the Steam Store API and caches the result.
     * @param appId - Steam application ID (e.g. `"730"` for CS2).
     * @returns The game title, or `undefined` if the API returns no data.
     * @throws If the Steam API request fails.
     */
    public async getGameTitle(appId: string): Promise<string | undefined> {
        if (await this.gameTitleCache.has(appId)) {
            this.logger.info(`${appId} found in cache`);
            return this.gameTitleCache.get(appId);
        }

        try {
            const res = await axios.get<SteamApiResponse>(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
            this.logger.info(`${appId} not found in cache. Getting title from api`);

            if (!res.data[appId]?.success) {
                this.logger.warn(`App ID ${appId} not found on Steam (removed or archived)`);
                return undefined;
            }

            const gameTitle = res.data[appId].data.name;
            await this.gameTitleCache.set(appId, gameTitle);
            return gameTitle;
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Failed to fetch game title for appId ${appId}: ${error.message}`);
        }
    }
}

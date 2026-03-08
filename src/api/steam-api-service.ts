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

    public async getGameTitle(appId: string): Promise<string | undefined> {
        if (await this.gameTitleCache.has(appId)) {
            this.logger.info(`${appId} found in cache`);
            return this.gameTitleCache.get(appId);
        }

        try {
            const res = await axios.get<SteamApiResponse>(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
            let gameTitle;
            this.logger.info(`${appId} not found in cache. Getting title from api`);
            if (res.data[appId]?.success) {
                gameTitle = res.data[appId].data.name;
            }

            if (!gameTitle) {
                throw new Error(`No data found for appId: ${appId}`);
            }

            await this.gameTitleCache.set(appId, gameTitle);
            return gameTitle;
        } catch (err: unknown) {
            const error = toError(err);
            throw new Error(`Failed to fetch game title for appId ${appId}: ${error.message}`);
        }
    }
}

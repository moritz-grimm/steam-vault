import axios from "axios";
import { GameTitleCache } from "src/api/game-title-cache";
import { toError } from "src/utils/error-utils";
import { Logger } from "winston";

type SteamApiResponse = {
    [appId: string]: {
        data: {
            name: string,
        }
    }
};

export class SteamApiService {
    constructor(
        private readonly logger: Logger,
        private readonly gameTitleCache: GameTitleCache,
    ) { }

    async getGameTitle(appId: string): Promise<string | undefined> {
        if (await this.gameTitleCache.has(appId)) {
            this.logger.info(`${appId} found in cache`);
            return this.gameTitleCache.get(appId);
        }

        try {
            const res = await axios.get<SteamApiResponse>(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
            this.logger.info(`${appId} not found in cache. Getting title from api`);
            const gameTitle = res.data[appId].data.name;

            if (!gameTitle) {
                this.logger.error(`No data found for appId: ${appId}`);
                console.error(`No data found for appId: ${appId}`);
                return undefined;
            }

            await this.gameTitleCache.set(appId, gameTitle);
            return gameTitle;
        } catch (err: unknown) {
            const error = toError(err);
            console.error("Error while fetching game title:", error.message);
            this.logger.error("Error while fetching game title:", error.message);
            return undefined;
        }
    }
}

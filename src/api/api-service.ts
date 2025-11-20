import axios from "axios";
import { toError } from "../utils/error-utils";
import { cacheContainsKey, getGameTitleFromCache, writeToCache } from "src/api/api-cache-service";
import { logger } from "src/utils/logger";

export async function getGameTitle(appId: string): Promise<string | undefined> {
    if (await cacheContainsKey(appId)) {
        logger.log("info", "Key found in cache");
        return await getGameTitleFromCache(appId);
    }

    try {
        const res = await axios.get(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
        logger.log("info", "Key not found in cache. Getting title from api");
        const gameTitle: string = res.data[appId].data.name;
        await writeToCache(appId, gameTitle);
        return gameTitle;
    } catch (err: unknown) {
        const error = toError(err);
        console.error("Error while fetching game title:", error.message);
        return undefined;
    }
}

export async function uploadToCloud(gameTitle: string): Promise<void> {
    logger.log("info", "Simulating upload");
    logger.log("info", "Uploading " + gameTitle);
    return new Promise(resolve => setTimeout(resolve, 500));
}

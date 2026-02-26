import fs from "node:fs/promises";
import { getSettingsConfig } from "src/config-service";
import { toError } from "src/utils/error-utils";

type GameTitleCache = Record<string, string>;

let memoryCache: GameTitleCache | null = null;

/** @deprecated Use GameTitleCache.set() instead */
export async function writeToCache(appId: string, gameTitle: string): Promise<void> {
    try {
        const cache = await loadCache();
        cache[appId] = gameTitle;

        await fs.writeFile(getSettingsConfig().gameTitleCache, JSON.stringify(cache, null, 2), "utf-8");

        memoryCache = cache;
    } catch (err: unknown) {
        const error = toError(err);
        console.error("Error in writeToCache():", error);
        throw error;
    }
}

/** @deprecated Use GameTitleCache.loadFromDisk() instead */
async function loadCache(): Promise<GameTitleCache> {
    if (memoryCache) return memoryCache;

    try {
        const cache = await fs.readFile(getSettingsConfig().gameTitleCache, "utf-8");
        memoryCache = JSON.parse(cache) as GameTitleCache;
        return memoryCache;
    } catch {
        memoryCache = {};
        return memoryCache;
    }
}

/**
 * Searches the cache for a specific appId
 * @param appId AppId matching
 * @returns true if the key is found or false if not
 * @deprecated Use GameTitleCache.has() instead
 */
export async function cacheContainsKey(appId: string): Promise<boolean> {
    const cache = await loadCache();

    if (appId in cache) {
        return true;
    }

    return false;
}

/** @deprecated Use GameTitleCache.get() instead */
export async function getGameTitleFromCache(appId: string): Promise<string> {
    const cache = await loadCache();
    return cache[appId];
}

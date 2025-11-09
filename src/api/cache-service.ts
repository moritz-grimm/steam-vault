import fs from 'node:fs/promises';
import path from "node:path";
import { toError } from "src/utils/error-utils";
import { getDirname } from "src/utils/filepath-utils";

const cacheFilePath = path.resolve(getDirname(), "../../steamvault-cache.json");

type GameNameCache = Record<string, string>;

let memoryCache: GameNameCache | null = null;

export async function writeToCache(appId: string, gameName: string): Promise<void> {
    try {
        const cache = await loadCache();
        cache[appId] = gameName;

        await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2), "utf-8");

        memoryCache = cache;
    } catch (err: unknown) {
        const error = toError(err);
        console.error("Error in writeToCache():", error);
        throw error;
    }
}

export async function loadCache(): Promise<GameNameCache> {
    if (memoryCache) return memoryCache;

    try {
        const cache = await fs.readFile(cacheFilePath, "utf-8");
        memoryCache = JSON.parse(cache) as GameNameCache;
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
 */
export async function cacheContainsKey(appId: string): Promise<boolean> {
    const cache = await loadCache();

    if (appId in cache) {
        return true;
    }

    return false;
}

export async function getGameTitleFromCache(appId: string): Promise<string> {
    const cache = await loadCache();
    return cache[appId];
}

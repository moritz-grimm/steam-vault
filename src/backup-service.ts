import { getGameTitle } from "src/api/api-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { scanForScreenshotFolders } from "src/folder-scanner-service";
import { jsonConfig } from "src/steamvault";
import { logger } from "src/utils/logger";

/**
 * 
 */
export async function doFullBackup(): Promise<void> {
    const gameIds = await scanForScreenshotFolders(jsonConfig.folderpath);

    const results = await Promise.allSettled(
        gameIds.map(id => getGameTitle(id)),
    );

    for (const result of results) {
        if (result.status === 'fulfilled') {
            await uploadToCloud(result.value);
        } else {
            logger.log("error", "Failed: " + result.reason);
        }
    }
}

export async function doPartialBackup(iDs: Array<string>): Promise<void> {
    throw new NotImplementedException;
}

async function uploadToCloud(gameTitle: string | undefined): Promise<void> {
    logger.log("info", "Simulating upload");
    logger.log("info", "Uploading " + gameTitle);
    return new Promise(resolve => setTimeout(resolve, 500));
}

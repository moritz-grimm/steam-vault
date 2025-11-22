import { getGameTitle, uploadToOneDrive } from "src/api/api-service";
import { getSettingsConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { scanForScreenshotFolders } from "src/folder-scanner-service";
import { logger } from "src/utils/logger";

/**
 *
 */
export async function doFullBackup(): Promise<void> {
    const gameIds = await scanForScreenshotFolders(getSettingsConfig().folderpath);

    const results = await Promise.allSettled(
        gameIds.map(id => getGameTitle(id)),
    );

    for (const result of results) {
        if (result.status === "fulfilled") {
            await uploadToOneDrive(result.value);
        } else {
            logger.log("error", "Failed: " + result.reason);
        }
    }
}

export async function doPartialBackup(iDs: Array<string>): Promise<void> {
    throw new NotImplementedException;
}



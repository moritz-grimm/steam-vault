import { exiftool } from "exiftool-vendored";
import { toError } from "exiftool-vendored/dist/ErrorsAndWarnings";
import { getGameTitle, uploadToOneDrive } from "src/api/api-service";
import { ConfigService, getSettingsConfig, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { scanForScreenshotFolders, scanForScreenshots } from "src/utils/scan-utils";
import { hashExists, hashScreenshot } from "src/utils/hash-utils";
import { logger } from "src/utils/logger";
import { Logger } from "winston";

type ScreenshotData = {
    gameId: string,
    gameTitle: string,
    screenshots: string[]; // saved as filenames
};

export class BackupService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }


}

/** @deprecated Use BackupService.doFullBackup() */
export async function doFullBackup(): Promise<void> {
    const gameIds = await scanForScreenshotFolders(getSettingsConfig().screenshotFolderPath);

    const screenshotDataResults: PromiseSettledResult<ScreenshotData>[] = await Promise.allSettled(
        gameIds.map(async (id) => {
            const gameTitle = await getGameTitle(id) ?? "";
            const screenshots = await scanForScreenshots(id);

            return {
                gameId: id,
                gameTitle: gameTitle,
                screenshots,
            };
        }),
    );

    try {
        for (const result of screenshotDataResults) {
            if (result.status === "fulfilled") {
                const { gameId, gameTitle, screenshots } = result.value;

                for (const screenshot of screenshots) {
                    try {
                        const screenshotHash = hashScreenshot(gameId, screenshot);
                        if (!hashExists(screenshotHash, gameId, screenshot)) {
                            await uploadToOneDrive(gameId, gameTitle, screenshot);
                        }
                    } catch (err: unknown) {
                        const error = toError(err);
                        logger.log("error", `Failed to upload ${screenshot}: ${error}`);
                    }

                }
            } else {
                logger.log("error", "Failed: " + result.reason);
            }
        }
    } finally {
        console.log("Upload successful");
        await exiftool.end();
    }
}

export async function doPartialBackup(iDs: Array<string>): Promise<void> {
    throw new NotImplementedException;
}

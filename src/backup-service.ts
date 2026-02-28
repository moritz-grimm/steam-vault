import { exiftool } from "exiftool-vendored";
import { getGameTitle, uploadToOneDrive } from "src/api/api-service";
import { SteamApiService } from "src/api/steam-api-service";
import { ConfigService, getSettingsConfig, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { HashService } from "src/hash-service";
import { toError } from "src/utils/error-utils";
import { hashExists, hashScreenshot } from "src/utils/hash-utils";
import { logger } from "src/utils/logger";
import { scanForScreenshotFolders, scanForScreenshots } from "src/utils/scan-utils";
import { Logger } from "winston";

type GameScreenshots = {
    gameId: string,
    gameTitle: string,
    filenames: string[]; // saved as filenames
};

export class BackupService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
        private readonly steamApiService: SteamApiService,
        private readonly hashService: HashService,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    public async runFull(): Promise<void> {
        const gameIds = await scanForScreenshotFolders(this.config.screenshotFolderPath);

        const gameScreenshots: PromiseSettledResult<GameScreenshots>[] = await Promise.allSettled(
            gameIds.map(async(id) => {
                const gameTitle = await this.steamApiService.getGameTitle(id) ?? "";
                const filenames = await scanForScreenshots(id);

                return {
                    gameId: id,
                    gameTitle: gameTitle,
                    filenames,
                };
            }),
        );

         try {
        for (const game of gameScreenshots) {
            if (game.status === "fulfilled") {
                const { gameId, gameTitle, filenames } = game.value;

                for (const filename of filenames) {
                    try {
                        const screenshotHash = this.hashService.hashScreenshot(gameId, filename);
                        if (!this.hashService.exists(screenshotHash, gameId, filename)) {
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

/** @deprecated Use BackupService.runFull() instead */
export async function doFullBackup(): Promise<void> {
    const gameIds = await scanForScreenshotFolders(getSettingsConfig().screenshotFolderPath);

    const screenshotDataResults: PromiseSettledResult<ScreenshotData>[] = await Promise.allSettled(
        gameIds.map(async(id) => {
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

import { exiftool } from "exiftool-vendored";
import { OneDriveService } from "src/api/onedrive-service";
import { SteamApiService } from "src/api/steam-api-service";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { HashService } from "src/hash-service";
import { toError } from "src/utils/error-utils";
import { writeExifMetadata } from "src/utils/exif-utils";
import { getScreenshotPath } from "src/utils/filepath-utils";
import { printSuccess } from "src/utils/print";
import { scanForScreenshotFolders, scanForScreenshots } from "src/utils/scan-utils";
import { Logger } from "winston";

// TODO: Implement concurrent uploading
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
        private readonly onedriveService: OneDriveService,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    public async runFull(): Promise<void> {
        const gameIds = await scanForScreenshotFolders(this.config.screenshotFolderPath);

        const gameScreenshots: PromiseSettledResult<GameScreenshots>[] = await Promise.allSettled(
            gameIds.map(async(id) => {
                const gameTitle = await this.steamApiService.getGameTitle(id) ?? "";
                const filenames = await scanForScreenshots(this.config.screenshotFolderPath, id);

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
                            const screenshotHash = await this.hashService.hashScreenshot(gameId, filename);
                            if (!await this.hashService.exists(screenshotHash)) {
                                const screenshotPath = getScreenshotPath(this.config.screenshotFolderPath, gameId, filename);
                                const screenshotBackupPath = `${this.config.backupPath}/${filename}`;

                                this.logger.info(`Creating screenshot backup for: ${screenshotPath}`);
                                this.logger.info("Writing EXIF metadata");
                                await writeExifMetadata(screenshotPath, screenshotBackupPath);
                                this.logger.info("EXIF metadata written successfully");

                                await this.onedriveService.uploadScreenshot(gameTitle, filename, screenshotPath);
                                await this.hashService.add(gameId, filename, screenshotHash);
                            }
                        } catch (err: unknown) {
                            this.logger.error(`Failed to upload file: ${filename}`, toError(err));
                        }
                    }
                } else {
                    this.logger.error(`Failed to load data`, game.reason);
                }
            }
        } finally {
            await this.onedriveService.uploadHashJson();
            await exiftool.end();
            printSuccess("Upload successful");
        }
    }

    public async runPartial(iDs: Array<string>): Promise<void> {
        throw new NotImplementedException;
    }
}

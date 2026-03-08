import { Presets, SingleBar } from "cli-progress";
import { exiftool } from "exiftool-vendored";
import pLimit from "p-limit";
import { OneDriveService } from "src/api/onedrive-service";
import { SteamApiService } from "src/api/steam-api-service";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { NotImplementedException } from "src/errors/not-implemented-exception";
import { HashService } from "src/hash-service";
import { toError } from "src/utils/error-utils";
import { writeExifMetadata } from "src/utils/exif-utils";
import { getScreenshotPath } from "src/utils/filepath-utils";
import { print, printError, printInfo, printSuccess } from "src/utils/print";
import { scanForScreenshotFolders, scanForScreenshots } from "src/utils/scan-utils";
import { Logger } from "winston";

type GameScreenshots = {
    gameId: string,
    gameTitle: string,
    filenames: string[], // saved as filenames
};

type PendingUpload = {
    gameId: string,
    gameTitle: string,
    filename: string,
    screenshotHash: string,
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

    private async collectPendingUploads(): Promise<PendingUpload[]> {
        const gameIds = await scanForScreenshotFolders(this.config.screenshotDirectory);
        const pendingUploads: PendingUpload[] = [];

        const gameScreenshots: PromiseSettledResult<GameScreenshots>[] = await Promise.allSettled(
            gameIds.map(async(id) => {
                const gameTitle = await this.steamApiService.getGameTitle(id) ?? "";
                const filenames = await scanForScreenshots(this.config.screenshotDirectory, id);

                return {
                    gameId: id,
                    gameTitle: gameTitle,
                    filenames,
                };
            }),
        );

        for (const game of gameScreenshots) {
            if (game.status === "fulfilled") {
                const { gameId, gameTitle, filenames } = game.value;

                for (const filename of filenames) {
                    try {
                        const screenshotHash = await this.hashService.hashScreenshot(gameId, filename);
                        if (!await this.hashService.exists(screenshotHash)) {
                            pendingUploads.push({ gameId, gameTitle, filename, screenshotHash });
                        }
                    } catch (err: unknown) {
                        this.logger.error("Error while collecting screenshot to upload", toError(err));
                    }
                }
            } else {
                this.logger.error(`Failed to load data`, game.reason);
                printError(`Failed to load game data: ${toError(game.reason).message}`);
            }
        }

        return pendingUploads;
    }

    private async uploadScreenshots(pendingUploads: PendingUpload[]): Promise<{ successCount: number; failCount: number }> {
        const limit = pLimit(5);
        const progressBar = new SingleBar({}, Presets.shades_classic);
        progressBar.start(pendingUploads.length, 0);
        let successCount = 0;
        let failCount = 0;
        const errorArray: string[] = [];

        const tasks = pendingUploads.map(upload =>
            limit(async() => {
                const { gameId, gameTitle, filename, screenshotHash } = upload;
                try {
                    const screenshotPath = getScreenshotPath(this.config.screenshotDirectory, gameId, filename);
                    const screenshotBackupPath = `${this.config.backupPath}/${gameId}-${filename}`;

                    this.logger.info(`Creating screenshot backup for: ${screenshotPath}`);
                    this.logger.info("Writing EXIF metadata");
                    await writeExifMetadata(screenshotPath, screenshotBackupPath);
                    this.logger.info("EXIF metadata written successfully");

                    await this.onedriveService.uploadScreenshot(gameTitle, filename, screenshotPath);
                    await this.hashService.add(gameId, filename, screenshotHash);
                    successCount++;
                } catch (err: unknown) {
                    const error = toError(err);
                    this.logger.error(`Failed to upload file: ${filename}`, error);
                    errorArray.push(`Failed to upload file: ${filename} - ${error.message}`);
                    failCount++;
                }
                progressBar.increment();
            }),
        );

        await Promise.allSettled(tasks);
        progressBar.stop();

        errorArray.forEach(err => {
            printError(err);
        });

        return { successCount, failCount };
    }

    public async runFull(): Promise<void> {
        const pendingUploads = await this.collectPendingUploads();

        if (pendingUploads.length === 0) {
            printSuccess("No new screenshots to upload");
            return;
        }

        try {
            const result = await this.uploadScreenshots(pendingUploads);
            await this.onedriveService.uploadHashJson();

            if (result.failCount === 0 && result.successCount > 0) {
                printSuccess(`Backup complete: ${result.successCount} file(s) uploaded`);
            } else if (result.failCount > 0 && result.successCount > 0) {
                printInfo(`Backup complete: ${result.successCount} uploaded, ${result.failCount} failed`);
            } else if (result.failCount > 0 && result.successCount === 0) {
                printError(`Backup failed: all ${result.failCount} file(s) failed`);
            }
        } finally {
            await exiftool.end();
        }
    }

    public async runDryRunFull(): Promise<void> {
        const pendingUploads = await this.collectPendingUploads();

        if (pendingUploads.length === 0) {
            printSuccess("No new screenshots to upload");
            return;
        }

        for (const upload of pendingUploads) {
            const { gameTitle, filename } = upload;

            print(`[DRY-RUN] Uploading Screenshot: ${filename} from game ${gameTitle}`);
        }

        const rootPath = this.config.oneDriveRootPath.replace("special/", "");
        printInfo(`[DRY-RUN] Would upload ${pendingUploads.length} screenshots to ${rootPath}/${this.config.oneDriveBaseFolder}/Game-Title`);
    }

    // Ignore because it's not implemented yet
    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
    public async runPartial(iDs: Array<string>): Promise<void> {
        throw new NotImplementedException;
    }
}

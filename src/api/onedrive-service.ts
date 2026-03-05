import axios from "axios";
import { readFile } from "node:fs/promises";
import { AuthService } from "src/auth/ms-auth";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { toError } from "src/utils/error-utils";
import { attemptWithRetries } from "src/utils/retry-utils";
import { sanitizeGameTitle } from "src/utils/string-utils";
import { Logger } from "winston";

export class OneDriveService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
        private readonly authService: AuthService,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    private async uploadFile(remotePath: string, localPath: string, contentType: string): Promise<void> {
        const token = await this.authService.getToken();
        const fileBuffer = await readFile(localPath);

        try {
            await attemptWithRetries(async() => {
                await axios.put(remotePath, fileBuffer, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": contentType,
                    },
                });
            }, 3, 1000, (attempt, err) => { this.logger.warn(`Upload attempt ${attempt} failed with error: ${toError(err)}`);},
            );
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                throw new Error(`Upload failed [${err.response.status}] for ${localPath}: ${err.response.data}`);
            }
            throw new Error(`Upload failed for ${localPath}: ${toError(err).message}`);
        }
    }

    /**
     * Uploads a screenshot to OneDrive.
     * @param gameTitle - Title of the game (used as folder name)
     * @param filename - Filename of the screenshot
     * @param screenshotPath - Local path to the screenshot file
     */
    public async uploadScreenshot(gameTitle: string, filename: string, screenshotPath: string): Promise<void> {
        const sanitizedGameTitle = sanitizeGameTitle(gameTitle);
        const remotePath = `https://graph.microsoft.com/v1.0/me/drive/${this.config.oneDriveRootPath}:/${this.config.oneDriveBaseFolder}/${sanitizedGameTitle}/${filename}:/content`;

        this.logger.info("Uploading screenshot");
        await this.uploadFile(remotePath, screenshotPath, "image/jpeg");
        this.logger.info(`Screenshot uploaded: ${filename}`);
    }

    public async uploadHashJson(): Promise<void> {
        const localPath = this.config.screenshotHashes;
        const remotePath = `https://graph.microsoft.com/v1.0/me/drive/${this.config.oneDriveRootPath}:/${this.config.oneDriveBaseFolder}/screenshot.hashes.json:/content`;

        this.logger.info("Uploading screenshot hash json");
        await this.uploadFile(remotePath, localPath, "application/json");
        this.logger.info("Upload of screenshot hash json successful");
    }
}

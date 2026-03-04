import axios from "axios";
import { readFile } from "node:fs/promises";
import { AuthService } from "src/auth/ms-auth";
import { ConfigService, SteamVaultConfig } from "src/config-service";
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
            await axios.put(remotePath, fileBuffer, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": contentType,
                },
            });
        } catch (err: unknown) {
            const status = axios.isAxiosError(err) ? err.response?.status : "unknown";
            const detail = axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : String(err);
            throw new Error(`Upload failed [${status}] for ${localPath}: ${detail}`);
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

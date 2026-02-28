import axios from "axios";
import { readFile } from "node:fs/promises";
import { AuthService } from "src/auth/ms-auth";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { writeExifMetadata } from "src/utils/exif-utils";
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
            const detail = axios.isAxiosError(err) ? err.response?.data : err;
            this.logger.error(`Upload failed [${status}] for ${localPath}:`, detail);
            throw new Error(`Upload failed (${status}): ${localPath}`);
        }
    }

    /**
     * Orchestrating screenshot upload
     * @param gameId - Id of the game
     * @param gameTitle - Title of the game
     * @param filename - Filename of the screenshot
     */
    public async uploadScreenshot(gameId: string, gameTitle: string, filename: string): Promise<void> {
        const localPath = `${this.config.screenshotFolderPath}/${gameId}/screenshots/${filename}`;
        const backupPath = `${this.config.backupPath}/${filename}`;

        const sanitizedGameTitle = sanitizeGameTitle(gameTitle);
        const remotePath = `https://graph.microsoft.com/v1.0/me/drive/special/photos:/SteamVault/${sanitizedGameTitle}/${filename}:/content`; //TODO Make this path configurable by the user

        this.logger.info(`Creating screenshot backup for : ${localPath}`);

        this.logger.info("Writing EXIF metadata");
        await writeExifMetadata(localPath, backupPath);
        this.logger.info("EXIF metadata written successfully");

        this.logger.info("Uploading screenshot");
        await this.uploadFile(remotePath, localPath, "image/jpeg");
        this.logger.info(`Screenshot uploaded: ${filename}`);
    }

    public async uploadHashJson(): Promise<void> {
        const localPath = this.config.screenshotHashes;
        const remotePath = "https://graph.microsoft.com/v1.0/me/drive/special/photos:/SteamVault/screenshot-hashes.json:/content";

        this.logger.info("Uploading screenshot hash json");
        await this.uploadFile(remotePath, localPath, "application/json");
        this.logger.info("Upload of screenshot hash json successful");
    }
}

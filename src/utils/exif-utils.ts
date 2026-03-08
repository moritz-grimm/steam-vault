import { exiftool } from "exiftool-vendored";
import { copyFile, stat, unlink } from "node:fs/promises";
import { toError } from "src/utils/error-utils";

/**
 * Writes EXIF metadata (DateTimeOriginal, XPComment) to a screenshot file.
 * Creates a backup copy first; if the EXIF write fails, the original is restored.
 * @param filePath - Path to the screenshot to modify in-place.
 * @param backupPath - Temporary path for the safety backup copy.
 * @throws If the write fails and the backup restore also fails.
 */
export async function writeExifMetadata(filePath: string, backupPath: string): Promise<void> {
    try {
        await copyFile(filePath, backupPath);

        const fileMetadata = await stat(filePath);
        const creationDate = fileMetadata.birthtime.toISOString();

        await exiftool.write(
            filePath,
            {
                DateTimeOriginal: creationDate,
                XPComment: "Uploaded by SteamVault",
            },
            {
                writeArgs: ["-overwrite_original"],
            },
        );

        await unlink(backupPath);
    } catch (err) {
        try {
            await copyFile(backupPath, filePath);
            await unlink(backupPath);
        } catch (error) {
            throw new Error(`EXIF write failed and backup restore also failed: ${toError(error).message}`);
        }
        throw new Error(`EXIF write failed, original restored: ${toError(err).message}`);
    }
}

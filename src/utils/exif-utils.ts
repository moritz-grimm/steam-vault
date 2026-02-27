import { exiftool } from "exiftool-vendored";
import { copyFile, stat, unlink } from "node:fs/promises";
import { toError } from "src/utils/error-utils";

export async function writeExifMetadata(filePath: string, backupPath: string) {
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

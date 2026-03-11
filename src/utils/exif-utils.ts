import piexif from "piexifjs";
import { copyFile, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { toError } from "src/utils/error-utils";

/**
 * Formats a Date into EXIF DateTimeOriginal format "YYYY:MM:DD HH:MM:SS".
 */
function formatExifDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
}

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
        const creationDate = fileMetadata.birthtime;

        const jpegData = await readFile(filePath, "binary");
        const exifDict = piexif.load(jpegData);

        if (!exifDict.Exif) exifDict.Exif = {};
        if (!exifDict["0th"]) exifDict["0th"] = {};

        const formatted = formatExifDate(creationDate);
        exifDict.Exif[piexif.ExifIFD.DateTimeOriginal] = formatted;

        const exifBytes = piexif.dump(exifDict);
        const newJpeg = piexif.insert(exifBytes, jpegData);
        await writeFile(filePath, Buffer.from(newJpeg, "binary"));

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

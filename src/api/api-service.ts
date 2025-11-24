import axios from "axios";
import { toError } from "../utils/error-utils";
import { cacheContainsKey, getGameTitleFromCache, writeToCache } from "src/api/api-cache-service";
import { logger } from "src/utils/logger";
import { getMicrosoftToken } from "src/auth/ms-auth";
import fs from "node:fs";
import { exiftool } from "exiftool-vendored";

/**
 * Retrieves the title of a Steam game based on its App ID.
 *
 * This function first checks a local cache to avoid unnecessary API requests.
 * If the title is not cached, it queries the Steam Store API for the game
 * metadata, stores the retrieved title in the cache, and then returns it.
 *
 * The Steam API returns a structured object where the game title can be found at:
 * `response.data[appId].data.name`
 *
 * @async
 * @function getGameTitle
 * @param {string} appId - The Steam App ID of the game to retrieve the title for.
 *
 * @returns {Promise<string | undefined>}
 * Resolves with the game's title if found. Returns `undefined` when an error occurs
 * or the API response does not contain valid title data.
 *
 * @throws {never}
 * Errors are caught internally — they will be logged and the function will return `undefined`.
 */
export async function getGameTitle(appId: string): Promise<string | undefined> {
    if (await cacheContainsKey(appId)) {
        logger.log("info", "Key found in cache");
        return await getGameTitleFromCache(appId);
    }

    try {
        const res = await axios.get(`http://store.steampowered.com/api/appdetails/?appids=${appId}`);
        logger.log("info", "Key not found in cache. Getting title from api");
        const gameTitle: string = res.data[appId].data.name;
        await writeToCache(appId, gameTitle);
        return gameTitle;
    } catch (err: unknown) {
        const error = toError(err);
        console.error("Error while fetching game title:", error.message);
        return undefined;
    }
}

/**
 * Uploads a Steam screenshot to OneDrive under the user's "Photos/SteamVault" directory.
 *
 * This function performs the following steps:
 * 1. Reads filesystem metadata of the provided screenshot (creation date).
 * 2. Writes EXIF metadata (e.g., DateTimeOriginal, XPComment) into the image file.
 * 3. Uploads the modified file to OneDrive using the Microsoft Graph API.
 *
 * The upload target folder is automatically created by OneDrive if it does not exist.
 *
 * @async
 * @function uploadToOneDrive
 * @param {string} gameId - The Steam game ID used to locate the screenshot in the local Steam userdata folders.
 * @param {string} gameTitle - The display title of the game. Used to generate a sanitized folder name in OneDrive.
 * @param {string} screenshot - The filename of the screenshot (e.g., "20250101235901_1.jpg").
 *
 * @throws {Error} Throws when the OneDrive upload fails or metadata could not be written.
 *
 * @returns {Promise<void>} Resolves when the upload succeeds.
 */
export async function uploadToOneDrive(gameId: string, gameTitle: string, screenshot: string): Promise<void> {
    const token = await getMicrosoftToken();
    const filePath = `C:/Program Files (x86)/Steam/userdata/906825544/760/remote/${gameId}/screenshots/${screenshot}`;
    const fileStats = fs.statSync(filePath);
    const creationDate = fileStats.birthtime.toISOString();

    // TODO: Implement logic to get rid of _original files with ["-overwrite_original"]
    await exiftool.write(filePath, {
        DateTimeOriginal: creationDate,
        XPComment: "Uploaded by SteamVault",
    });

    const fileBuffer = fs.readFileSync(filePath);

    logger.log("info", `Filepath ${filePath}`);
    logger.log("info", `Uploading ${screenshot}`);
    logger.log("info", `Gametitle: ${gameTitle}`);

    const sanitizedGameTitle = gameTitle
        .replaceAll(":", " -") // Colon
        .replaceAll("/", " ") // Slash
        .replaceAll(/[\\*?"<>|]/g, "") // Everything else
        .replaceAll(/\s+g/g, " ") // Combine mutliple whitespaces
        .trim();

    try {
        const uploadResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/special/photos:/SteamVault/${sanitizedGameTitle}/${screenshot}:/content`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "image/jpeg",
                },
                body: fileBuffer,
            },
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            logger.log("error", `OneDrive Response Status: ${uploadResponse.status}`);
            logger.log("error", `OneDrive Response Body: ${errorText}`);
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        logger.log("info", `Upload of image ${filePath} successful`);
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error(`Error on uploading to OneDrive: ${error.message}`);
    }
}

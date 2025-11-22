import axios from "axios";
import { toError } from "../utils/error-utils";
import { cacheContainsKey, getGameTitleFromCache, writeToCache } from "src/api/api-cache-service";
import { logger } from "src/utils/logger";
import { getMicrosoftToken } from "src/auth/ms-auth";
import fs from "node:fs";
import { exiftool } from "exiftool-vendored";

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

export async function uploadToOneDrive(gameTitle: string): Promise<void> {
    const token = await getMicrosoftToken();
    const folderName = "SteamVault";
    const filePath = "C:/Program Files (x86)/Steam/userdata/906825544/760/remote/3164500/screenshots/20250921194833_1.jpg";
    const fileName = "20250921194833_1.jpg";

    const fileBuffer = fs.readFileSync(filePath);

    const fileStats = fs.statSync(filePath);
    const creationDate = fileStats.birthtime.toISOString();

    await exiftool.write(filePath, {
        DateTimeOriginal: creationDate,
        XPComment: "Uploaded by SteamVault",
    });

    await exiftool.end();

    try {
        const uploadResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/drive/special/photos:/${folderName}/${fileName}:/content`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "imgage/jpg",
                },
                body: fileBuffer,
            },
        );

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        logger.log("info", `Upload of image ${filePath} successful`);
    } catch (err: unknown) {
        const error = toError(err);
        throw new Error("Error on uploading to OneDrive", error);
    }
}

import * as msal from "@azure/msal-node";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { getSettingsConfig } from "src/config-service";
import { logger } from "src/utils/logger";

const beforeCacheAccess = async (cacheContext: msal.TokenCacheContext): Promise<void> => {
    if (existsSync(getSettingsConfig().msalCache)) {
        const cacheData = readFileSync(getSettingsConfig().msalCache, "utf-8");
        cacheContext.tokenCache.deserialize(cacheData);
    }
};

const afterCacheAccess = async (cacheContext: msal.TokenCacheContext): Promise<void> => {
    if (cacheContext.cacheHasChanged) {
        writeFileSync(getSettingsConfig().msalCache, cacheContext.tokenCache.serialize());
    }
};

function getMsalConfig(): msal.Configuration {
    return {
        auth: {
            clientId: getSettingsConfig().entraClientId,
            authority: "https://login.microsoftonline.com/common",
        },
        cache: {
            cachePlugin: {
                beforeCacheAccess,
                afterCacheAccess,
            },
        },
    };
};

export async function loginToMicrosoft(): Promise<msal.AuthenticationResult | null | undefined> {
    const pca = new msal.PublicClientApplication(getMsalConfig());

    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length > 0) {
        logger.log("info", "Account found in cache. Using silent login");
        const silentResult = await pca.acquireTokenSilent({
            scopes: ["Files.ReadWrite", "User.Read"],
            account: accounts[0],
        });

        return silentResult;
    }

    const deviceCodeRequest: msal.DeviceCodeRequest = {
        scopes: ["Files.ReadWrite", "User.Read"],
        deviceCodeCallback: (response) => {
            console.log(response.message);
        },
    };

    try {
        const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
        logger.log("info", "Microsoft Login successfull");
        return response;
    } catch (error) {
        console.error("Login failed:", error);
    }
}

export async function logoutOfMicrosoft(): Promise<void> {
    const pca = new msal.PublicClientApplication(getMsalConfig());
    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length === 0) {
        logger.log("info", "No user is currently logged in.");
        return;
    }

    for (const acc of accounts) {
        await pca.getTokenCache().removeAccount(acc);
    }

    if (existsSync(getSettingsConfig().msalCache)) {
        unlinkSync(getSettingsConfig().msalCache);
    }

    logger.log("info", "User successfully logged out.");
}

/**
 * Tries to fetch an access token from cache; if this fails, it asks the user to log in. If this also fails, it throws an error.
 *
 * @throws Could not authenticate
 * @returns A Microsoft access token
 */
export async function getMicrosoftToken(): Promise<string> {
    const loginResponse = await loginToMicrosoft();
    if (!loginResponse) throw new Error("Could not authenticate");

    return loginResponse.accessToken;
}

/**
 * Checks if the user is logged in
 * @returns A boolean value depending on if the user is logged in or not
 */
export async function isLoggedIn(): Promise<boolean> {
    const config = getMsalConfig();
    const pca = new msal.PublicClientApplication(config);
    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length === 0) {
        return false;
    }

    return true;
}

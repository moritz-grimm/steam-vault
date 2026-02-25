import * as msal from "@azure/msal-node";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { Logger } from "winston";

const SCOPES = ["Files.ReadWrite", "User.Read"];

// ──────────────────────────────────────────────
// AuthService
// ──────────────────────────────────────────────
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    private get config(): SteamVaultConfig {
        return this.configService.get();
    }

    private getMsalConfig(): msal.Configuration {
        return {
            auth: {
                clientId: this.config.entraClientId,
                authority: "https://login.microsoftonline.com/common",
            },
            cache: {
                cachePlugin: {
                    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/explicit-function-return-type
                    beforeCacheAccess: async (cacheContext: msal.TokenCacheContext) => {
                        const msalCache = this.config.msalCache;
                        if (existsSync(msalCache)) {
                            const cacheData = readFileSync(msalCache, "utf-8");
                            cacheContext.tokenCache.deserialize(cacheData);
                        }
                    },
                    // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/explicit-function-return-type
                    afterCacheAccess: async (cacheContext: msal.TokenCacheContext) => {
                        if (cacheContext.cacheHasChanged) {
                            writeFileSync(this.config.msalCache, cacheContext.tokenCache.serialize());
                        }
                    },
                },
            },
        };
    }

    private createClient(): msal.PublicClientApplication {
        return new msal.PublicClientApplication(this.getMsalConfig());
    }

    async login(): Promise<msal.AuthenticationResult | null | undefined> {
        const pca = this.createClient();
        const accounts = await pca.getTokenCache().getAllAccounts();

        if (accounts.length > 0) {
            this.logger.info("Account found in cache. Using silent login");
            return await pca.acquireTokenSilent({
                scopes: SCOPES,
                account: accounts[0],
            });
        }

        const deviceCodeRequest: msal.DeviceCodeRequest = {
            scopes: SCOPES,
            deviceCodeCallback: (response) => {
                console.log(response.message);
            },
        };

        try {
            const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
            this.logger.info("Microsoft Login successful");
            return response;
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    async logout(): Promise<void> {
        const pca = this.createClient();
        const accounts = await pca.getTokenCache().getAllAccounts();
        const msalCache = this.config.msalCache;

        if (accounts.length === 0) {
            this.logger.info("No user is currently logged in.");
            return;
        }

        for (const acc of accounts) {
            await pca.getTokenCache().removeAccount(acc);
        }

        if (existsSync(msalCache)) {
            unlinkSync(msalCache);
        }

        this.logger.info("User successfully logged out.");
    }

    async getToken(): Promise<string> {
        const loginResponse = await this.login();
        if (!loginResponse) throw new Error("Could not authenticate");
        return loginResponse.accessToken;
    }

    async isLoggedIn(): Promise<boolean> {
        const pca = this.createClient();
        const accounts = await pca.getTokenCache().getAllAccounts();
        return accounts.length > 0;
    }
}

// ──────────────────────────────────────────────
// Legacy exports - remove when all callers are refactored
// Used by: auth-settings-menu.ts, api-service.ts
// ──────────────────────────────────────────────

import { getSettingsConfig } from "src/config-service";

const legacyBeforeCacheAccess = async (cacheContext: msal.TokenCacheContext): Promise<void> => {
    if (existsSync(getSettingsConfig().msalCache)) {
        const cacheData = readFileSync(getSettingsConfig().msalCache, "utf-8");
        cacheContext.tokenCache.deserialize(cacheData);
    }
};

const legacyAfterCacheAccess = async (cacheContext: msal.TokenCacheContext): Promise<void> => {
    if (cacheContext.cacheHasChanged) {
        writeFileSync(getSettingsConfig().msalCache, cacheContext.tokenCache.serialize());
    }
};

function legacyGetMsalConfig(): msal.Configuration {
    return {
        auth: {
            clientId: getSettingsConfig().entraClientId,
            authority: "https://login.microsoftonline.com/common",
        },
        cache: {
            cachePlugin: {
                beforeCacheAccess: legacyBeforeCacheAccess,
                afterCacheAccess: legacyAfterCacheAccess,
            },
        },
    };
}

/** @deprecated Use AuthService.login() */
export async function loginToMicrosoft(): Promise<msal.AuthenticationResult | null | undefined> {
    const pca = new msal.PublicClientApplication(legacyGetMsalConfig());
    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length > 0) {
        const silentResult = await pca.acquireTokenSilent({
            scopes: SCOPES,
            account: accounts[0],
        });
        return silentResult;
    }

    const deviceCodeRequest: msal.DeviceCodeRequest = {
        scopes: SCOPES,
        deviceCodeCallback: (response) => {
            console.log(response.message);
        },
    };

    try {
        const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
        return response;
    } catch (error) {
        console.error("Login failed:", error);
    }
}

/** @deprecated Use AuthService.logout() */
export async function logoutOfMicrosoft(): Promise<void> {
    const pca = new msal.PublicClientApplication(legacyGetMsalConfig());
    const accounts = await pca.getTokenCache().getAllAccounts();

    if (accounts.length === 0) return;

    for (const acc of accounts) {
        await pca.getTokenCache().removeAccount(acc);
    }

    if (existsSync(getSettingsConfig().msalCache)) {
        unlinkSync(getSettingsConfig().msalCache);
    }
}

/** @deprecated Use AuthService.getToken() */
export async function getMicrosoftToken(): Promise<string> {
    const loginResponse = await loginToMicrosoft();
    if (!loginResponse) throw new Error("Could not authenticate");
    return loginResponse.accessToken;
}

/** @deprecated Use AuthService.isLoggedIn() */
export async function isLoggedIn(): Promise<boolean> {
    const pca = new msal.PublicClientApplication(legacyGetMsalConfig());
    const accounts = await pca.getTokenCache().getAllAccounts();
    return accounts.length > 0;
}

import * as msal from "@azure/msal-node";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { printInfo } from "src/utils/print";
import { Logger } from "winston";

const SCOPES = ["Files.ReadWrite", "User.Read"];

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
                    beforeCacheAccess: async(cacheContext: msal.TokenCacheContext): Promise<void> => {
                        try {
                            const cacheData = await readFile(this.config.msalCache, "utf-8");
                            cacheContext.tokenCache.deserialize(cacheData);
                        } catch (err) {
                            if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
                        }
                    },
                    afterCacheAccess: async(cacheContext: msal.TokenCacheContext): Promise<void> => {
                        if (cacheContext.cacheHasChanged) {
                            await writeFile(this.config.msalCache, cacheContext.tokenCache.serialize());
                        }
                    },
                },
            },
        };
    }

    private createClient(): msal.PublicClientApplication {
        return new msal.PublicClientApplication(this.getMsalConfig());
    }

    /**
     * Authenticates with Microsoft. Uses cached tokens silently when available,
     * otherwise falls back to the device code flow (prints a URL for the user to visit).
     * @returns The MSAL authentication result containing the access token.
     * @throws If the device code flow fails or is cancelled.
     */
    public async login(): Promise<msal.AuthenticationResult> {
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
                printInfo(response.message);
            },
        };

        const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);

        if (!response) {
            throw new Error("Microsoft login failed. Please check your internet connection and try again");
        }

        this.logger.info("Microsoft Login successful");
        return response;
    }

    /** Removes all cached accounts and deletes the MSAL token cache file. */
    public async logout(): Promise<void> {
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

        await unlink(msalCache).catch(() => {});

        this.logger.info("User successfully logged out.");
    }

    /**
     * Convenience method that calls {@link login} and returns just the access token string.
     * @throws If authentication fails.
     */
    public async getToken(): Promise<string> {
        const loginResponse = await this.login();
        if (!loginResponse) throw new Error("Could not authenticate");
        return loginResponse.accessToken;
    }

    /** Returns `true` if at least one account exists in the MSAL token cache. */
    public async isLoggedIn(): Promise<boolean> {
        const pca = this.createClient();
        const accounts = await pca.getTokenCache().getAllAccounts();
        return accounts.length > 0;
    }
}

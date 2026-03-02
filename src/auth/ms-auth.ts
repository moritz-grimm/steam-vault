import * as msal from "@azure/msal-node";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { ConfigService, SteamVaultConfig } from "src/config-service";
import { toError } from "src/utils/error-utils";
import { printError, printInfo } from "src/utils/print";
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

    public async login(): Promise<msal.AuthenticationResult | null | undefined> {
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

        try {
            const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
            this.logger.info("Microsoft Login successful");
            return response;
        } catch (error) {
            printError(`Login failed: ${toError(error)}`);
        }
    }

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

        if (existsSync(msalCache)) {
            unlinkSync(msalCache);
        }

        this.logger.info("User successfully logged out.");
    }

    public async getToken(): Promise<string> {
        const loginResponse = await this.login();
        if (!loginResponse) throw new Error("Could not authenticate");
        return loginResponse.accessToken;
    }

    public async isLoggedIn(): Promise<boolean> {
        const pca = this.createClient();
        const accounts = await pca.getTokenCache().getAllAccounts();
        return accounts.length > 0;
    }
}

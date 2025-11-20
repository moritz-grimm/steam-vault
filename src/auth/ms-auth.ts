import * as msal from "@azure/msal-node";
import { getAuthConfig } from "src/config-service";
import { logger } from "src/utils/logger";

function getMsalConfig(): msal.Configuration {
    return {
        auth: {
            clientId: getAuthConfig().entraClientId,
            authority: "https://login.microsoftonline.com/common",
        },
    };
};

export async function loginToMicrosoft(): Promise<msal.AuthenticationResult | null | undefined> {
    const config = getMsalConfig();
    const pca = new msal.PublicClientApplication(config);

    const deviceCodeRequest: msal.DeviceCodeRequest = {
        scopes: ["Files.ReadWrite", "User.Read"],
        deviceCodeCallback: (response) => {
            console.log(response.message);
        },
    };

    try {
        const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
        logger.log("info", "Login successfull");
        logger.log("info", `Access Token: ${response?.accessToken}`); // TODO: For testing purposes. REMOVE THIS
        return response;
    } catch (error) {
        console.error("Login failed:", error);
    }
}

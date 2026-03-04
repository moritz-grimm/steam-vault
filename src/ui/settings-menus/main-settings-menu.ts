import { input, select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { printAuthSettings } from "src/ui/settings-menus/auth-settings-menu";
import { printOneDriveSettings } from "src/ui/settings-menus/onedrive-settings-menu";
import { handleScreenshotDirectoryPathChange } from "src/ui/settings-menus/settings-handlers";
import { isValidDirectory } from "src/utils/filepath-utils";

export async function printSettings(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService">): Promise<void> {
    let running = true;

    while (running) {
        if (!ctx.cliOptions.debug) console.clear();

        const answer = await select({
            message: "Choose a setting",
            choices: [
                {
                    name: "Screenshot Directory",
                    value: "screenshotDirectory",
                    description: `Current directory: '${ctx.configService.get().screenshotDirectory}'`,
                },
                {
                    name: "OneDrive Settings",
                    value: "oneDriveSettings",
                    description: "Configure the OneDrive upload destination",
                },
                {
                    name: "Auth Setting",
                    value: "authSettings",
                    description: "Login/Logout for your Microsoft Account",
                },
                {
                    name: "Return",
                    value: "return",
                    description: "Return to the main menu",
                },

            ],
        });

        switch (answer) {
            case "screenshotDirectory":
                await printScreenshotDirectoryPrompt(ctx);
                break;
            case "oneDriveSettings":
                await printOneDriveSettings(ctx);
                break;
            case "authSettings":
                await printAuthSettings(ctx);
                break;
            case "return":
                running = false;
                break;
        };
    }
}

export async function printScreenshotDirectoryPrompt(ctx: Pick<AppContext, "configService">): Promise<void> {
    const userInput = await input({
        message: "Enter a valid path to your steam screenshot directory. Type exit to return:",
        required: true,
        validate: (value: string) => {
            if (value.toLowerCase() === "exit") return true;

            const isValid = isValidDirectory(value);

            if (!isValid.valid) {
                return isValid.reason;
            }

            return true;
        },
    });

    if (userInput.toLowerCase() === "exit") return;

    await handleScreenshotDirectoryPathChange(ctx, userInput);
}

import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { printAuthSettings } from "src/ui/settings-menus/auth-settings-menu";
import { printDirectorySettings } from "src/ui/settings-menus/directory-settings-menu";
import { printOneDriveSettings } from "src/ui/settings-menus/onedrive-settings-menu";
import { clearScreen } from "src/utils/print";

export async function printSettings(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService">): Promise<void> {
    let running = true;

    while (running) {
        clearScreen(ctx);

        const answer = await select({
            message: "Choose a setting",
            choices: [
                {
                    name: "Screenshot Directory Settings",
                    value: "screenshotDirSettings",
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
            case "screenshotDirSettings":
                await printDirectorySettings(ctx);
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

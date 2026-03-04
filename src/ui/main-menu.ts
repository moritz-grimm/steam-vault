import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { printPartialOrFullBackupPrompt } from "src/ui/backup-menu";
import { printScreenshotDirectoryPrompt, printSettings } from "src/ui/settings-menus/main-settings-menu";
import { clearScreen, print, printInfo } from "src/utils/print";

export async function printMainMenu(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService" | "backupService">): Promise<void> {
    let running = true;

    while (running) {
        clearScreen(ctx);

        if (!ctx.configService.get().screenshotDirectory) {
            printInfo("No screenshot path detected. Please enter one to continue");

            await printScreenshotDirectoryPrompt(ctx);

            if (!ctx.configService.get().screenshotDirectory) {
                clearScreen(ctx);
                print("No screenshot directory detected. Exiting program");
                return;
            }
        }

        const answer = await select({
            message: "Choose an option",
            choices: [
                {
                    name: "Run Backup",
                    value: "run backup",
                    description: "Start the backup with the currently configured directory",
                },
                {
                    name: "Settings",
                    value: "settings",
                    description: "Open settings",
                },
                {
                    name: "Exit",
                    value: "exit",
                    description: "Exit SteamVault",
                },
            ],
        });

        switch (answer) {
            case "run backup":
                await printPartialOrFullBackupPrompt(ctx);
                break;
            case "settings":
                await printSettings(ctx);
                break;
            case "exit":
                clearScreen(ctx);
                print("Exiting program");
                running = false;
                break;
        }
    }
}

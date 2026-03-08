import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { printPartialOrFullBackupPrompt } from "src/ui/backup-menu";
import { promptAutodetectDirectory, printScreenshotDirectoryPrompt } from "src/ui/settings-menus/directory-settings-menu";
import { printSettings } from "src/ui/settings-menus/main-settings-menu";
import { clearScreen, print, printInfo } from "src/utils/print";

export async function printMainMenu(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService" | "backupService">): Promise<void> {
    let running = true;

    while (running) {
        clearScreen(ctx);

        if (!ctx.configService.get().screenshotDirectory) {
            const configured = await promptInitialScreenshotDirectory(ctx);
            if (!configured) {
                clearScreen(ctx);
                print("No screenshot directory detected. Exiting program");
                return;
            }
        }

        if (ctx.cliOptions.dryRun) {
            clearScreen(ctx);
            printInfo("Running in Dry-Run mode. No new screenshots will be uploaded");
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

/**
 * Handles initial screenshot directory setup when none is configured.
 * Tries auto-detection first, then falls back to manual input.
 * @returns true if a directory was configured, false if the user skipped/cancelled
 */
async function promptInitialScreenshotDirectory(ctx: Pick<AppContext, "configService">): Promise<boolean> {
    const accepted = await promptAutodetectDirectory(ctx);
    if (accepted) return true;

    printInfo("No screenshot path detected. Please enter one to continue");
    await printScreenshotDirectoryPrompt(ctx);

    return !!ctx.configService.get().screenshotDirectory;
}

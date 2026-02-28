import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { printPartialOrFullBackupPrompt } from "src/ui/backup-menu";
import { handleDirectoryPathInput, printSettings } from "src/ui/settings-menus/main-settings-menu";

export async function printMainMenu(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService" | "backupService">): Promise<void> {
    let running = true;

    while (running) {
        if (!ctx.cliOptions.debug) console.clear();

        if (!ctx.configService.get().screenshotFolderPath) {
            console.log("No screenshot path detected. Please enter one to continue");

            const pathSet = await handleDirectoryPathInput(ctx);

            if (!pathSet) {
                console.log("Exiting program");
                return;
            }
        }

        const answer = await select({
            message: "Choose an option",
            choices: [
                {
                    name: "Run Backup",
                    value: "run backup",
                    description: "Start the backup with the currently configured folderpath",
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
                if (!ctx.cliOptions.debug) console.clear();
                console.log("Exiting program");
                running = false;
                break;
        }
    }
}

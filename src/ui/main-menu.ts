import { select } from "@inquirer/prompts";
import { getCliConfig } from "src/config-service";
import { printPartialOrFullBackupPrompt } from "src/ui/backup-menu";
import { printSettings } from "src/ui/settings-menus/main-settings-menu";

export async function printMainMenu(): Promise<void> {
    let running = true;

    while (running) {
        if (!getCliConfig().debug) console.clear();

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
                await printPartialOrFullBackupPrompt();
                break;
            case "settings":
                await printSettings();
                break;
            case "exit":
                if (!getCliConfig().debug) console.clear();
                console.log("Exiting program");
                running = false;
                break;
        }
    }
};



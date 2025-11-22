import { select } from "@inquirer/prompts";
import { doFullBackup, doPartialBackup } from "src/backup-service";
import { getCliConfig } from "src/config-service";

export async function printPartialOrFullBackupPrompt(): Promise<void> {
    if (!getCliConfig().debug) console.clear();

    const answer = await select({
        message: "Choose between full or partial backup",
        choices: [
            {
                name: "Full",
                value: "full",
                description: "Backup every screenshot folder",
            },
            {
                name: "Partial",
                value: "partial",
                description: "Choose a specific folder you want to backup",
            },
            {
                name: "Return",
                value: "return",
                description: "Return to the main menu",
            },
        ],
    });

    switch (answer) {
        case "full":
            await doFullBackup();
            break;
        case "partial":
            await doPartialBackup();
            break;
        case "return":
            break;
    }
}

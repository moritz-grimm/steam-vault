import { input, select } from "@inquirer/prompts";
import path from "node:path";
import { isValidDirectory } from "src/utils/filepath-utils";
import { handleBackup, handleDirectoryPathInput, handleSettings } from "./menu-controller";
import { getCliConfig, getJsonConfig } from "src/config-service";

// TODO: Refactor from inquirer to inquirer/prompts

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
                await handleBackup();
                break;
            case "settings":
                await handleSettings();
                break;
            case "exit":
                if (!getCliConfig().debug) console.clear();
                console.log("Exiting program");
                running = false;
                break;
        }
    }
};

export async function printSettings(): Promise<void> {
    let running = true;

    while (running) {
        if (!getCliConfig().debug) console.clear();

        const answer = await select({
            message: "Choose a setting",
            choices: [
                {
                    name: "Folderpath",
                    value: "folderpath",
                    description: `Current folderpath: '${getJsonConfig().folderpath}'`,
                },
                {
                    name: "Return",
                    value: "return",
                    description: "Return to the main menu",
                },

            ],
        });

        switch (answer) {
            case "folderpath":
                await handleDirectoryPathInput();
                break;
            case "return":
                running = false;
                break;
        };
    }
};

/**
 * Asks the user his new preferred directory path and returns it
 * @returns The new directory path
 */
export async function printDirectoryPathPrompt(): Promise<string> {
    const userInput = await input({
        message: "Enter a valid path to your steam screenshot directory",
        required: true,
        validate: (value: string) => {
            return isValidDirectory(value);
        },
    });

    return path.resolve(userInput);
}

export async function printPartialOrFullBackupPrompt(): Promise<string> {
    if (!getCliConfig().debug) console.clear();
    return await select({
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
}

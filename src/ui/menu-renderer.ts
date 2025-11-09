import { input, select } from "@inquirer/prompts";
import inquirer from "inquirer";
import path from "node:path";
import { isValidDirectory } from "src/utils/filepath-utils";
import { cliConfig } from './../steamvault';
import { handleBackup, handleDirectoryPathInput, handleSettings } from "./menu-controller";
import { MainMenuAnswer, SettingsMenuAnswer } from "./menu-types";

// TODO: Refactor from inquirer to inquirer/prompts

export async function printMainMenu(): Promise<void> {
    let running = true;

    while (running) {
        if (!cliConfig.debug) console.clear();
        const answer = await inquirer.prompt<MainMenuAnswer>([
            {
                name: "mainMenu",
                message: "Choose a option",
                type: "list",
                choices: ["Run Backup", "Settings", "Exit"],
            },
        ]);

        switch (answer.mainMenu) {
            case "Run Backup":
                await handleBackup();
                break;
            case "Settings":
                await handleSettings();
                break;
            case "Exit":
                if (!cliConfig.debug) console.clear();
                console.log("Exiting program");
                running = false;
                break;
        }
    }
};

export async function printSettings(): Promise<void> {
    let running = true;

    while (running) {
        if (!cliConfig.debug) console.clear();
        const answer = await inquirer.prompt<SettingsMenuAnswer>([
            {
                name: "settingsMenu",
                message: "Choose a setting",
                type: "list",
                choices: ["Folderpath", "Return"],
            },
        ]);

        switch (answer.settingsMenu) {
            case "Folderpath":
                await handleDirectoryPathInput();
                break;
            case "Return":
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
    if (!cliConfig.debug) console.clear();
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
                description: "Choose a folder you want to backup",
            },
            {
                name: "Return",
                value: "return",
                description: "Return to the main menu",
            },
        ],
    });
}

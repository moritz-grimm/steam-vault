import inquirer from "inquirer";
import { MainMenuAnswer, SettingsMenuAnswer } from "./menu-types";
import { handleBackup, handleDirectoryPathInput, handleSettings } from "./menu-controller";
import { input } from "@inquirer/prompts";
import { isValidDirectory } from "src/utils/filepath-utils";
import path from "node:path";

// TODO: Refactor from inquirer to inquirer/prompts

export async function printMainMenu(): Promise<void> {
    let running = true;

    while (running) {
        // console.clear();
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
                // console.clear();
                console.log("Exiting program");
                running = false;
                break;
        }
    }
};

export async function printSettings(): Promise<void> {
    let running = true;

    while (running) {
        // console.clear();
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

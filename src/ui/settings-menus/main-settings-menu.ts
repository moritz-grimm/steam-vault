import { input, select } from "@inquirer/prompts";
import path from "node:path";
import { getCliConfig, getSettingsConfig, writeToSettingsConfig } from "src/config-service";
import { printAuthSettings } from "src/ui/settings-menus/auth-settings-menu";

import { isValidDirectory } from "src/utils/filepath-utils";

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
                    description: `Current folderpath: '${getSettingsConfig().screenshotFolderPath}'`,
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
            case "folderpath":
                await handleDirectoryPathInput();
                break;
            case "authSettings":
                await printAuthSettings();
                break;
            case "return":
                running = false;
                break;
        };
    }
};

export async function handleDirectoryPathInput(): Promise<void> {
    const dirPath = await printDirectoryPathPrompt();
    if (!dirPath) {
        return;
    }
    await writeToSettingsConfig("folderpath", dirPath);
}

/**
 * Asks the user his new preferred directory path and returns it
 * @returns The new directory path
 */
export async function printDirectoryPathPrompt(): Promise<string | null> {
    const userInput = await input({
        message: "Enter a valid path to your steam screenshot directory. Type exit to return:",
        required: true,
        validate: (value: string) => {
            if (value.toLowerCase() === "exit") return true;

            return isValidDirectory(value);
        },
    });

    if (userInput.toLowerCase() === "exit") return null;

    return path.resolve(userInput);
}

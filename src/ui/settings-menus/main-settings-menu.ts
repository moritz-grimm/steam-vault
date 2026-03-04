import { input, select } from "@inquirer/prompts";
import path from "node:path";
import { AppContext } from "src/app-context";
import { printAuthSettings } from "src/ui/settings-menus/auth-settings-menu";
import { isValidDirectory } from "src/utils/filepath-utils";

export async function printSettings(ctx: Pick<AppContext, "configService" | "cliOptions" | "authService">): Promise<void> {
    let running = true;

    while (running) {
        if (!ctx.cliOptions.debug) console.clear();

        const answer = await select({
            message: "Choose a setting",
            choices: [
                {
                    name: "Screenshot Folder Path",
                    value: "folderpath",
                    description: `Current folderpath: '${ctx.configService.get().screenshotFolderPath}'`,
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
                await handleDirectoryPathInput(ctx);
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

export async function handleDirectoryPathInput(ctx: Pick<AppContext, "configService">): Promise<boolean> {
    const dirPath = await printDirectoryPathPrompt();
    if (!dirPath) {
        return false;
    }
    await ctx.configService.write("screenshotFolderPath", dirPath);
    return true;
}

/**
 * Asks the user his new preferred directory path and returns it
 * @returns The new directory path
 */
export async function printDirectoryPathPrompt(): Promise<string | null> {
    // TODO: add validation that the entered path is really a steam path & instructions on how the path has to look like
    const userInput = await input({
        message: "Enter a valid path to your steam screenshot directory. Type exit to return:",
        required: true,
        validate: (value: string) => {
            if (value.toLowerCase() === "exit") return true;

            return isValidDirectory(value);
        },
    });

    if (userInput.toLowerCase() === "exit") return null;

    return path.resolve(userInput).replaceAll("\\", "/");
}

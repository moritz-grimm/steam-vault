import { input, select, confirm } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { handleScreenshotDirectoryPathChange } from "src/ui/settings-menus/settings-handlers";
import { detectSteamScreenshotPath, isSteamScreenshotDirectory } from "src/utils/filepath-utils";
import { clearScreen } from "src/utils/print";

export async function printDirectorySettings(ctx: Pick<AppContext, "cliOptions" | "configService">): Promise<void> {
    let running = true;
    while (running) {
        clearScreen(ctx);

        const answer = await select({
            message: "Select a new Steam Directory or autodetect it",
            choices: [
                {
                    name: "Select a new Directory manually",
                    value: "newManualDir",
                    description: `Current directory: '${ctx.configService.get().screenshotDirectory}'`,
                },
                {
                    name: "Autodetect the Steam directory",
                    value: "autodetectDir",
                    description: `Current directory: '${ctx.configService.get().screenshotDirectory}'`,
                },
                {
                    name: "Return",
                    value: "return",
                    description: "Return to the settings menu",
                },
            ],
        });

        switch (answer) {
            case "newManualDir":
                await printScreenshotDirectoryPrompt(ctx);
                break;
            case "autodetectDir":
                await promptAutodetectDirectory(ctx);
                break;
            case "return":
                running = false;
                break;
        }
    }
}

/**
 * Runs auto-detection for the Steam screenshot directory.
 * If found, prompts the user to confirm before saving.
 * @returns true if a directory was accepted and saved, false otherwise
 */
export async function promptAutodetectDirectory(ctx: Pick<AppContext, "configService">): Promise<boolean> {
    const detectedPath = await detectSteamScreenshotPath();

    if (!detectedPath) return false;

    const accepted = await confirm({ message: `"${detectedPath}" was autodetected as your screenshot folder. Is this correct?` });
    if (accepted) {
        await handleScreenshotDirectoryPathChange(ctx, detectedPath);
        return true;
    }

    return false;
}

export async function printScreenshotDirectoryPrompt(ctx: Pick<AppContext, "configService">): Promise<void> {
    const userInput = await input({
        message: "Enter a valid path to your steam screenshot directory. Type exit to return:",
        required: true,
        validate: (value: string) => {
            if (value.toLowerCase() === "exit") return true;

            const result = isSteamScreenshotDirectory(value);

            if (!result.valid) {
                return result.reason;
            }

            return true;
        },
    });

    if (userInput.toLowerCase() === "exit") return;

    await handleScreenshotDirectoryPathChange(ctx, userInput);
}

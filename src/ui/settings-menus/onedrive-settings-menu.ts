import { input, select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { handleOneDriveBaseFolderChange, handleOneDriveRootPathChange } from "src/ui/settings-menus/settings-handlers";
import { isValidOneDriveFolderName } from "src/utils/filepath-utils";

export async function printOneDriveSettings(ctx: Pick<AppContext, "cliOptions" | "configService">): Promise<void> {
    let running = true;
    while (running) {
        if (!ctx.cliOptions.debug) console.clear();

        const answer = await select({
            message: "Change OneDrive Root or Basefolder Path",
            choices: [
                {
                    name: "Root Path",
                    value: "rootPath",
                    description: `Current Root Path: ${ctx.configService.get().oneDriveRootPath.replace("special/", "")}`,
                },
                {
                    name: "Base Folder",
                    value: "baseFolder",
                    description: `Current Base Folder: ${ctx.configService.get().oneDriveBaseFolder}`,
                },
                {
                    name: "Return",
                    value: "return",
                    description: "Return to the settings menu",
                },
            ],
        });

        switch (answer) {
            case "rootPath":
                await printRootPathSelect(ctx);
                break;
            case "baseFolder":
                await printBaseFolderPrompt(ctx);
                break;
            case "return":
                running = false;
                break;
        }
    }
}

const rootPathMap: Record<string, string> = {
    root: "root",
    photos: "special/photos",
    documents: "special/documents",
    desktop: "special/desktop",
    cameraroll: "special/cameraroll",
};

async function printRootPathSelect(ctx: Pick<AppContext, "cliOptions" | "configService">): Promise<void> {
    if (!ctx.cliOptions.debug) console.clear();

    const answer = await select({
        message: "Choose a new Root Path",
        choices: [
            {
                name: "Root",
                value: "root",
                description: "The root folder",
            },
            {
                name: "Photos",
                value: "photos",
                description: "The Photos folder",
            },
            {
                name: "Documents",
                value: "documents",
                description: "The Documents folder",
            },
            {
                name: "Desktop",
                value: "desktop",
                description: "The Desktop folder",
            },
            {
                name: "Camera Roll",
                value: "cameraroll",
                description: "The Camera Roll Backup folder",
            },
            {
                name: "Return",
                value: "return",
                description: "Return back to the onedrive settings",
            },
        ],
    });

    if (answer === "return") return;

    const rootPath = rootPathMap[answer];
    if (rootPath) {
        await handleOneDriveRootPathChange(ctx, rootPath);
    }
}

async function printBaseFolderPrompt(ctx: Pick<AppContext, "cliOptions" | "configService">): Promise<void> {
    if (!ctx.cliOptions.debug) console.clear();

    const userInput = await input({
        message: "Enter a valid folder name. Type exit to return",
        required: true,
        validate: (value: string) => {
            if (value.toLowerCase() === "exit") return true;

            const isValid = isValidOneDriveFolderName(value);

            if (!isValid.valid) {
                return isValid.reason;
            }

            return true;
        },
    });

    if (userInput.toLowerCase() === "exit") return;

    await handleOneDriveBaseFolderChange(ctx, userInput);
}

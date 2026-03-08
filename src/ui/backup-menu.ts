import { input, select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { toError } from "src/utils/error-utils";
import { clearScreen, printError } from "src/utils/print";

export async function printPartialOrFullBackupPrompt(ctx: Pick<AppContext, "cliOptions" | "backupService">): Promise<void> {
    clearScreen(ctx);

    const answer = await select({
        message: "Choose between full or partial(wip) backup",
        choices: [
            {
                name: "Full",
                value: "full",
                description: "Backup every screenshot folder",
                disabled: ctx.cliOptions.dryRun,
            },
            {
                name: "Full Dry-Run",
                value: "fullDryRun",
                description: "Run a full backup without actually uploading any files",
            },
            // {
            //     name: "Partial",
            //     value: "partial",
            //     description: "Choose a specific folder you want to backup",
            // },
            {
                name: "Return",
                value: "return",
                description: "Return to the main menu",
            },
        ],
    });

    switch (answer) {
        case "full":
            try {
                clearScreen(ctx);
                await ctx.backupService.runFull();
            } catch (err: unknown) {
                printError(`Backup failed: ${toError(err).message}`);
            }
            await input({ message: "Press Enter to return to the main menu" });
            break;
        case "fullDryRun":
            try {
                clearScreen(ctx);
                await ctx.backupService.runDryRunFull();
            } catch (err: unknown) {
                printError(`Backup failed: ${toError(err).message}`);
            }
            await input({ message: "Press Enter to return to the main menu" });
            break;
        case "partial":
            try {
                await ctx.backupService.runPartial([]);
            } catch (err: unknown) {
                printError(`Backup failed: ${toError(err).message}`);
            }
            await input({ message: "Press Enter to return to the main menu" });
            break;
        case "return":
            break;
    }
}

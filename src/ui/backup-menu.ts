import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { toError } from "src/utils/error-utils";
import { printError } from "src/utils/print";

export async function printPartialOrFullBackupPrompt(ctx: Pick<AppContext, "cliOptions" | "backupService">): Promise<void> {
    if (!ctx.cliOptions.debug) console.clear();

    const answer = await select({
        message: "Choose between full or partial(wip) backup",
        choices: [
            {
                name: "Full",
                value: "full",
                description: "Backup every screenshot folder",
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
                await ctx.backupService.runFull();
            } catch (err: unknown) {
                printError(`Backup failed: ${toError(err).message}`);
            }
            break;
        case "partial":
            try {
                await ctx.backupService.runPartial([]);
            } catch (err: unknown) {
                printError(`Backup failed: ${toError(err).message}`);
            }
            break;
        case "return":
            break;
    }
}

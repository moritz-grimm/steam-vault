import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";

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
            await ctx.backupService.runFull();
            break;
        case "partial":
            await ctx.backupService.runPartial();
            break;
        case "return":
            break;
    }
}

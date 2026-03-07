import { Command } from "commander";
import { version } from "package.json";

export type CliOptions = {
    debug: boolean,
    dryRun: boolean,
};

export function parseCLIArgs(): CliOptions {
    const program = new Command();

    program
        .name("SteamVault")
        .version(version)
        .option("-d, --debug", "Disable console clearing for better debugging", false)
        .option("--dry-run", "Show what would be uploaded without uploading", false);

    program.parse(process.argv);
    const options: CliOptions = program.opts();

    return {
        debug: options.debug,
        dryRun: options.dryRun,
    } as CliOptions;
}

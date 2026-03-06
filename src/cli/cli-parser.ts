import { Command } from "commander";
import { version } from "package.json";

export type CliOptions = {
    debug: boolean;
};

export function parseCLIArgs(): CliOptions {
    const program = new Command();

    program
        .name("SteamVault")
        .version(version)
        .option("--debug", "Disable console clearing for better debugging", false);

    program.parse(process.argv);
    const options: CliOptions = program.opts();

    return {
        debug: options.debug,
    } as CliOptions;
}

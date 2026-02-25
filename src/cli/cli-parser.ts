import { Command } from "commander";

export type CliOptions = {
    debug: boolean;
};

export function parseCLIArgs(): CliOptions {
    const program = new Command();

    program
        .name("SteamVault")
        .version("1.0.0") // TODO: Get the version from package.json
        .option("--debug", "Disable console clearing for better debugging", false);

    program.parse(process.argv);
    const options: CliOptions = program.opts();

    return {
        debug: options.debug,
    } as CliOptions;
}

import { Command } from "commander";
import { logger } from "src/utils/logger";

export type CliOptions = {
    debug: boolean;
};

export function parseCLIArgs(): CliOptions {
    const program = new Command();

    program
        .name("SteamVault")
        .version("1.0.0")
        .option("--debug", "Disable console clearing for better debugging", false);

    program.parse(process.argv);
    const options: CliOptions = program.opts();

    // TODO: Fix the logger printing "undefined" into the console
    logger.log("info", options);

    return {
        debug: options.debug,
    } as CliOptions;
}

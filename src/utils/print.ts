import chalk, { ForegroundColorName, BackgroundColorName } from "chalk";
import { AppContext } from "src/app-context";


export function print(message: string): void {
    console.log(message);
}

export function printInfo(message: string): void {
    console.log(chalk.cyan(message));
}

export function printSuccess(message: string): void {
    console.log(chalk.green(message));
}

export function printError(message: string): void {
    console.log(chalk.red(message));
}

export function printColored(message: string, color: ForegroundColorName | BackgroundColorName): void {
    console.log(chalk[color](message));
}

export function clearScreen(ctx: Pick<AppContext, "cliOptions">): void{
    if (!ctx.cliOptions.debug) console.clear();
}

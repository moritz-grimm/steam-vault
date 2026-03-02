import chalk, { type ColorName } from "chalk";

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

export function printColored(message: string, color: ColorName): void {
    console.log(chalk[color](message));
}

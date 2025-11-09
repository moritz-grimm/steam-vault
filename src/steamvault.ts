import { parseCLIArgs } from "src/cli/cli-parser";
import { loadJsonConfig } from "./config-service";
import { printMainMenu } from "./ui/menu-renderer";

export const jsonConfig = await loadJsonConfig();
export const cliConfig = parseCLIArgs();

await printMainMenu();

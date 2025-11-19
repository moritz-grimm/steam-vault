import { loadConfigs } from "src/config-service";
import { printMainMenu } from "./ui/menu-renderer";
import "@dotenvx/dotenvx/config";

await loadConfigs();
await printMainMenu();

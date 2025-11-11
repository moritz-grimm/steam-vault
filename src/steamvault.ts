import { loadConfigs } from "src/config-service";
import { printMainMenu } from "./ui/menu-renderer";

await loadConfigs();
await printMainMenu();

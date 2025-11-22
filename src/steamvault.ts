import { loadConfigs } from "src/config-service";
import { printMainMenu } from "./ui/menu-renderer";
import "@dotenvx/dotenvx/config";
import { loginToMicrosoft } from "src/auth/ms-auth";

await loadConfigs();
await loginToMicrosoft();
await printMainMenu();

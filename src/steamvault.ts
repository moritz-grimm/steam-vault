import { getGameTitle } from "./api/api-service";
import { loadJsonConfig } from "./config-service";
import { scanForScreenshotFolders } from "./folder-scanner-service";
import { printMainMenu } from "./ui/menu-renderer";
import { logger } from "src/utils/logger";

// TODO: Add cli param to deactivate console.clear() for debugging purposes & when doing this add a setting to let the user decide too

const jsonConfig = await loadJsonConfig();

await scanForScreenshotFolders(jsonConfig.folderpath);

const test = await getGameTitle("1808500");

logger.log("info", "API Result: " + test);

await printMainMenu();

// parseCLIArgs();

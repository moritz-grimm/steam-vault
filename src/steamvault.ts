import { fetchGameTitle } from "./api-service";
import { parseCLIArgs } from "./cli-parser";
import { scanForScreenshotFolders } from "./folder-scanner-service";
import { printMainMenu } from "./ui/menu-renderer";
import { loadJsonConfig } from "./utils/json-utils";

// TODO: Add cli param to deactivate console.clear() for debugging purposes & when doing this add a setting to let the user decide too

let jsonConfig = await loadJsonConfig();

await scanForScreenshotFolders(jsonConfig.folderpath);

await printMainMenu();

// parseCLIArgs();



// let test = await fetchGameTitle("730");

// console.log(test);


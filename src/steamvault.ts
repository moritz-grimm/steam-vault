#!/usr/bin/env node

import "@dotenvx/dotenvx/config";
import { initializeApp } from "src/initialize-app";
import { printMainMenu } from "src/ui/main-menu";
import { toError } from "src/utils/error-utils";
import { printError } from "src/utils/print";

try {
    const ctx = await initializeApp();
    await printMainMenu(ctx);
} catch (err: unknown) {
    printError(`Fatal error: ${toError(err).message}`);
    process.exit(1);
}

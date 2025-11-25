#!/usr/bin/env node

import "@dotenvx/dotenvx/config";
import { printMainMenu } from "src/ui/main-menu";
import { initializeApp } from "src/initialize-app";

await initializeApp();
await printMainMenu();

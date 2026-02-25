#!/usr/bin/env node

import "@dotenvx/dotenvx/config";
import { printMainMenu } from "src/ui/main-menu";
import { initializeApp } from "src/initialize-app";

// TODO: There are multiple functions that don't follow SRP. Refactor
await initializeApp();
await printMainMenu();

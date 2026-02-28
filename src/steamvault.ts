#!/usr/bin/env node

import "@dotenvx/dotenvx/config";
import { initializeApp } from "src/initialize-app";
import { printMainMenu } from "src/ui/main-menu";

const ctx = await initializeApp();
await printMainMenu(ctx);

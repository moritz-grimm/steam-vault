import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";

// TODO? Move logger into different folder?
// TODO: As soon as config-service can load things on top-level replace this through 'getSettingsConfig().logDirPath'
const LOG_DIR_PATH = path.resolve(process.env.APPDATA || "", "SteamVault/logs");

if (!fs.existsSync(LOG_DIR_PATH)) {
    fs.mkdirSync(LOG_DIR_PATH);
}

export const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    transports: [
        new transports.File({ filename: path.join(LOG_DIR_PATH, "error.log"), level: "error" }),
        new transports.File({ filename: path.join(LOG_DIR_PATH, "combined.log") }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple(),
        ),
    }));
}

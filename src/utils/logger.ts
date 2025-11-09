import fs from "node:fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const logDir = "logs";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
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
        new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        new transports.File({ filename: path.join(logDir, "combined.log") }),
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

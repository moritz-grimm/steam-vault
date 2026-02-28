import fs from "node:fs";
import path from "node:path";
import { createLogger, format, Logger, transports } from "winston";

interface LoggerOptions {
    logDirPath: string;
    level?: string;
    enableConsole?: boolean;
}

function getDefaultLogDir(): string {
    return path.resolve(process.env.APPDATA || "", "SteamVault/logs");
}

export function createAppLogger(options?: Partial<LoggerOptions>): Logger {
    const {
        logDirPath = getDefaultLogDir(),
        level = "info",
        enableConsole = process.env.NODE_ENV !== "production",
    } = options ?? {};

    if (!fs.existsSync(logDirPath)) {
        fs.mkdirSync(logDirPath, { recursive: true });
    }

    const logger = createLogger({
        level,
        format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
        ),
        transports: [
            new transports.File({ filename: path.join(logDirPath, "error.log"), level: "error" }),
            new transports.File({ filename: path.join(logDirPath, "combined.log") }),
        ],
    });

    if (enableConsole) {
        logger.add(new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }));
    }

    return logger;
}

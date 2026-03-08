import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { getAppDataPath } from "src/utils/filepath-utils";
import { createLogger, format, Logger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

interface LoggerOptions {
    logDirPath: string;
    level?: string;
    enableConsole?: boolean;
}

function getDefaultLogDir(): string {
    return resolve(getAppDataPath(), "SteamVault/logs");
}

export function createAppLogger(options?: Partial<LoggerOptions>): Logger {
    const {
        logDirPath = getDefaultLogDir(),
        level = "info",
        enableConsole = process.env.NODE_ENV !== "production",
    } = options ?? {};

    if (!existsSync(logDirPath)) {
        mkdirSync(logDirPath, { recursive: true });
    }

    const errorTransport = new DailyRotateFile({
        dirname: logDirPath,
        filename: "error-%DATE%.log",
        level: "error",
        maxSize: "20m",
        maxFiles: "14d",
    });

    const combinedTransport = new DailyRotateFile({
        dirname: logDirPath,
        filename: "combined-%DATE%.log",
        level: "info",
        maxSize: "20m",
        maxFiles: "14d",
    });

    const logger = createLogger({
        level,
        format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
        ),
        transports: [
            combinedTransport,
            errorTransport,
        ],
    });

    if (enableConsole) {
        logger.add(new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }));
    }

    return logger;
}

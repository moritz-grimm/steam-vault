import { NotImplementedException } from "src/errors/not-implemented-exception";
import { printDirectoryPathPrompt, printSettings } from "./menu-renderer";
import { writeToJsonConfig } from "src/utils/json-utils";

export async function handleBackup(): Promise<void> {
    throw new NotImplementedException;
}

export async function handleSettings(): Promise<void> {
    await printSettings();
}

export async function handleDirectoryPathInput(): Promise<void> {
    const dirPath = await printDirectoryPathPrompt();
    await writeToJsonConfig("folderpath", dirPath);
}

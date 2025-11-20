import { writeToSettingsConfig } from "src/config-service";
import { printDirectoryPathPrompt, printPartialOrFullBackupPrompt, printSettings } from "./menu-renderer";
import { doFullBackup, doPartialBackup } from "src/backup-service";

export async function handleBackup(): Promise<void> {
    const userChoice = await printPartialOrFullBackupPrompt();
    // TODO: Backup everything or just a specific folder

    if (userChoice === "full") {
        await doFullBackup();
    } else if (userChoice === "partial") {
        await doPartialBackup();
    }
}

export async function handleSettings(): Promise<void> {
    await printSettings();
}

export async function handleDirectoryPathInput(): Promise<void> {
    const dirPath = await printDirectoryPathPrompt();
    await writeToSettingsConfig("folderpath", dirPath);
}

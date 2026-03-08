import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function readRegistryValue(
    hive: string,
    keyPath: string,
    valueName: string,
): Promise<string | null> {
    const fullPath = `${hive}\\${keyPath}`;

    try {
        const { stdout } = await execAsync(
            `reg query "${fullPath}" /v "${valueName}"`,
            { windowsHide: true },
        );

        const match = stdout.match(/REG_(?:SZ|EXPAND_SZ|DWORD)\s+(.+)/);
        return match ? match[1].trim() : null;
    } catch {
        return null;
    }
}

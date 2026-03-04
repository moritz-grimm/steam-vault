import path from "node:path";
import { AppContext } from "src/app-context";

export async function handleScreenshotDirectoryPathChange(ctx: Pick<AppContext, "configService">, rawPath: string): Promise<void> {
    const resolved = path.resolve(rawPath).replaceAll("\\", "/");
    await ctx.configService.write("screenshotDirectory", resolved);
}

export async function handleOneDriveRootPathChange(ctx: Pick<AppContext, "configService">, rootPath: string): Promise<void> {
    await ctx.configService.write("oneDriveRootPath", rootPath);
}

export async function handleOneDriveBaseFolderChange(ctx: Pick<AppContext, "configService">, folderName: string): Promise<void> {
    await ctx.configService.write("oneDriveBaseFolder", folderName);
}

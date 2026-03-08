import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";
import { toError } from "src/utils/error-utils";
import { clearScreen, printError, printInfo } from "src/utils/print";

export async function printAuthSettings(ctx: Pick<AppContext, "cliOptions" | "authService">): Promise<void> {
    clearScreen(ctx);

    const loggedIn = await ctx.authService.isLoggedIn();

    const authChoices = loggedIn
        ? [
            {
                name: "Logout",
                value: "logout",
                description: "Log out from your Microsoft account",
            },
        ]
        : [
            {
                name: "Login",
                value: "login",
                description: "Log in to your Microsoft account",
            },
        ];

    const answer = await select({
        message: "Login or Logout",
        choices: [
            ...authChoices,
            {
                name: "Return",
                value: "return",
                description: "Return to the settings menu",
            },
        ],
    });

    switch (answer) {
        case "login":
            try {
                await ctx.authService.login();
                printInfo("Login successful");
            } catch (err: unknown) {
                printError(`Login failed: ${toError(err).message}`);
            }
            break;
        case "logout":
            await ctx.authService.logout();
            break;
        case "return":
            break;
    }
}

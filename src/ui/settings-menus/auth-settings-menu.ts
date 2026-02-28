import { select } from "@inquirer/prompts";
import { AppContext } from "src/app-context";

export async function printAuthSettings(ctx: Pick<AppContext, "cliOptions" | "authService">): Promise<void> {
    if (!ctx.cliOptions.debug) console.clear();

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
            await ctx.authService.login();
            break;
        case "logout":
            await ctx.authService.logout();
            break;
        case "return":
            break;
    }
}

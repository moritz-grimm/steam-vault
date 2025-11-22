import { select } from "@inquirer/prompts";
import { isLoggedIn, loginToMicrosoft, logoutOfMicrosoft } from "src/auth/ms-auth";
import { getCliConfig } from "src/config-service";

export async function printAuthSettings(): Promise<void> {
    if (!getCliConfig().debug) console.clear();

    const loggedIn = await isLoggedIn();

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
            await loginToMicrosoft();
            break;
        case "logout":
            await logoutOfMicrosoft();
            break;
        case "return":
            break;
    }
}

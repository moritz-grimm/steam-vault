import { AuthService } from "src/auth/ms-auth";
import { CliOptions } from "src/cli/cli-parser";
import { ConfigService } from "src/config-service";
import { HashService } from "src/hash-service";

export type AppContext = {
    configService: ConfigService;
    authService: AuthService;
    hashService: HashService;
    cliOptions: CliOptions;
};
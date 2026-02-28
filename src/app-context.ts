import { AuthService } from "src/auth/ms-auth";
import { BackupService } from "src/backup-service";
import { CliOptions } from "src/cli/cli-parser";
import { ConfigService } from "src/config-service";

export type AppContext = {
    configService: ConfigService;
    cliOptions: CliOptions;
    authService: AuthService;
    backupService: BackupService;
};

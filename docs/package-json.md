# package.json Scripts

## SteamVault

| Script       | Description                                                                                |
| ------------ | ------------------------------------------------------------------------------------------ |
| `dev`        | Runs the app in development mode with console logging enabled &  console clearing disabled |
| `prod`       | Runs the app in production mode without console logging & console clearing enabled         |
| `prod:debug` | Runs the app in production mode without console logging &  console clearing disabled.      |

## ESLint

| Script     | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `lint`     | Lints all files and outputs all warnings and errors to the terminal.     |
| `lint:fix` | Lints all files and automatically fixes any issues that can be resolved. |

## dotenvx

| Script            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `dotenvx:decrypt` | Decrypts the `.env` file at runtime. Should be used when adding new keys.      |
| `dotenvx:encrypt` | Encrypts the `.env` file. **Only run if you know exactly what you are doing.** |

## Misc

| Script              | Description                             |
| ------------------- | --------------------------------------- |
| `sort-package-json` | Automatically sorts the `package.json`. |

/**
 * Sanitizes a game title for use as a OneDrive folder name by replacing or
 * removing characters that are invalid in file system paths (`:`, `/`, `\`, `*`, `?`, `"`, `<`, `>`, `|`, `®`, `™`).
 */
export function sanitizeGameTitle(gameTitle: string): string {
    return gameTitle
        .replaceAll(":", " -") // Colon
        .replaceAll("/", " ") // Slash
        .replaceAll(/[\\*?"<>|®™]/g, "") // Everything else
        .replaceAll(/\s+/g, " ") // Combine multiple whitespaces
        .trim();
}

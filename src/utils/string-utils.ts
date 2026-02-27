export function sanitizeGameTitle(gameTitle: string): string {
    return gameTitle
        .replaceAll(":", " -") // Colon
        .replaceAll("/", " ") // Slash
        .replaceAll(/[\\*?"<>|]/g, "") // Everything else
        .replaceAll(/\s+g/g, " ") // Combine mutliple whitespaces
        .trim();
}

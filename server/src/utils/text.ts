// Turns any value from the request into trimmed text, or '' if it isn't text.
export function text(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

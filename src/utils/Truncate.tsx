/** Truncate long binary string with remainder count */
export function truncateBin(bin: string, maxLen = 96): string {
    if (bin.length <= maxLen) return bin
    return bin.slice(0, maxLen) + ` …(+${bin.length - maxLen} bit)`
}

/** Truncate long text with ellipsis */
export function truncateText(text: string, maxLen = 120): string {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen) + `…`
}
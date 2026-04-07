/**
 * ─── FORMATTER ───
 * Converts normal text to Mathematical Monospace Unicode.
 * All bot responses pass through this to maintain the ⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙ brand.
 */

// Mathematical Monospace mappings (U+1D670 - U+1D6A3 for uppercase, U+1D68A - U+1D6BD for lowercase)
const MONO_UPPER = {};
const MONO_LOWER = {};
const MONO_DIGITS = {};

// Build uppercase A-Z → 𝙰-𝚉
for (let i = 0; i < 26; i++) {
    MONO_UPPER[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D670 + i);
}

// Build lowercase a-z → 𝚊-𝚣
for (let i = 0; i < 26; i++) {
    MONO_LOWER[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D68A + i);
}

// Build digits 0-9 → 𝟶-𝟿
for (let i = 0; i < 10; i++) {
    MONO_DIGITS[String.fromCharCode(48 + i)] = String.fromCodePoint(0x1D7F6 + i);
}

// Decorative characters
const DECO = {
    star:     '⸙',
    diamond:  '◈',
    sparkle:  '✦',
    bullet:   '❖',
    open:     '꒰',
    close:    '꒱',
    line:     '━',
    dot:      '•',
    arrow:    '➤',
    check:    '✓',
    cross:    '✗',
    crown:    '♛',
};

/**
 * Convert a string to Mathematical Monospace Unicode.
 * Preserves emojis, special characters, and line breaks.
 * @param {string} text
 * @returns {string}
 */
export function toMono(text) {
    if (!text) return '';
    let result = '';
    for (const char of text) {
        if (MONO_UPPER[char]) {
            result += MONO_UPPER[char];
        } else if (MONO_LOWER[char]) {
            result += MONO_LOWER[char];
        } else if (MONO_DIGITS[char]) {
            result += MONO_DIGITS[char];
        } else {
            result += char;
        }
    }
    return result;
}

/**
 * Create a decorated header line.
 * Example: ⸙━━━━━ 𝙼𝙴𝙽𝚄 ━━━━━⸙
 */
export function header(text) {
    const mono = toMono(text.toUpperCase());
    return `${DECO.star}${DECO.line.repeat(5)} ${mono} ${DECO.line.repeat(5)}${DECO.star}`;
}

/**
 * Create a subheader.
 * Example: ◈ 𝙰𝚍𝚖𝚒𝚗 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜
 */
export function subheader(text) {
    return `${DECO.diamond} ${toMono(text)}`;
}

/**
 * Create a bullet-point item.
 * Example: ❖ .𝚙𝚒𝚗𝚐 - 𝙲𝚑𝚎𝚌𝚔 𝚕𝚊𝚝𝚎𝚗𝚌𝚢
 */
export function bullet(text) {
    return `  ${DECO.bullet} ${toMono(text)}`;
}

/**
 * Create the bot tag/signature.
 * Returns: ⸙𝙴𝙻𝙳𝙴𝙻_𝙼𝙲-𝙱𝙾𝚃⸙
 */
export function botTag() {
    return `${DECO.star}${toMono('ELDEL_MC')}-${toMono('BOT')}${DECO.star}`;
}

/**
 * Build a full formatted message with header, body, and footer.
 * @param {string} title - Header text
 * @param {string} body  - Body text (will be converted to mono)
 * @param {object} [opts]
 * @param {boolean} [opts.addFooter=true]
 */
export function formatMessage(title, body, opts = {}) {
    const { addFooter = true } = opts;
    let msg = '';
    msg += header(title) + '\n\n';
    msg += toMono(body);
    if (addFooter) {
        msg += '\n\n' + `${DECO.line.repeat(3)} ${botTag()} ${DECO.line.repeat(3)}`;
    }
    return msg;
}

/**
 * Build a list with title and items.
 * @param {string} title
 * @param {string[]} items
 */
export function formatList(title, items) {
    let msg = subheader(title) + '\n';
    for (const item of items) {
        msg += bullet(item) + '\n';
    }
    return msg;
}

/**
 * Wrap a plain reply with mono formatting and footer.
 */
export function reply(text) {
    return toMono(text) + '\n\n' + `${DECO.line.repeat(3)} ${botTag()} ${DECO.line.repeat(3)}`;
}

export { DECO };

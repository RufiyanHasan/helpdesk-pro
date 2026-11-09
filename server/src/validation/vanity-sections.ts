const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const MAX_PAGE_TEXT_LENGTH = 100;
const CORNERS = ['rounded', 'square'];
const BRAND_MARKS = ['monogram', 'logo'];
const MAX_MONOGRAM_LETTERS = 2;
// 3 to 40 lowercase letters, numbers or hyphens, not starting or ending with a hyphen.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

// Checks one hideable text group from the browser, and keeps only the fields the page uses.
function textSetting(value: unknown) {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const { show, useCustom, customText, customColor } = value as Record<string, unknown>;
    if (
        typeof show !== 'boolean' ||
        typeof useCustom !== 'boolean' ||
        typeof customText !== 'string' ||
        customText.length > MAX_PAGE_TEXT_LENGTH ||
        typeof customColor !== 'string' ||
        !HEX_COLOR.test(customColor)
    ) {
        return null;
    }
    return { show, useCustom, customText, customColor };
}

function colorSetting(value: unknown) {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const { useCustom, customColor } = value as Record<string, unknown>;
    if (typeof useCustom !== 'boolean' || typeof customColor !== 'string' || !HEX_COLOR.test(customColor)) {
        return null;
    }
    return { useCustom, customColor };
}

// Each vanity page section, with a function that checks what the browser sends and returns only the
// fields to save, or null if anything is invalid.
export const VANITY_SECTIONS: Record<string, (body: Record<string, unknown>) => object | null> = {
    'page-text': (body) => {
        const districtName = textSetting(body.districtName);
        const subtext = textSetting(body.subtext);
        return districtName && subtext ? { districtName, subtext } : null;
    },
    'page-appearance': (body) => {
        const pageBackground = colorSetting(body.pageBackground);
        const cardBackground = colorSetting(body.cardBackground);
        const { buttonCorners } = body;
        if (!pageBackground || !cardBackground || typeof buttonCorners !== 'string' || !CORNERS.includes(buttonCorners)) {
            return null;
        }
        return { pageBackground, cardBackground, buttonCorners };
    },
    'monogram-logo': (body) => {
        const background = colorSetting(body.background);
        const letterColor = colorSetting(body.letterColor);
        const { show, useCustomLetters, customLetters } = body;
        if (
            !background ||
            !letterColor ||
            typeof show !== 'string' ||
            !BRAND_MARKS.includes(show) ||
            typeof useCustomLetters !== 'boolean' ||
            typeof customLetters !== 'string' ||
            customLetters.length > MAX_MONOGRAM_LETTERS
        ) {
            return null;
        }
        return { show, useCustomLetters, customLetters, background, letterColor };
    },
    'sign-in-block': (body) => {
        const heading = textSetting(body.heading);
        const cardBackground = colorSetting(body.cardBackground);
        const { showBorder, corners } = body;
        if (
            !heading ||
            !cardBackground ||
            typeof showBorder !== 'boolean' ||
            typeof corners !== 'string' ||
            !CORNERS.includes(corners)
        ) {
            return null;
        }
        return { heading, cardBackground, showBorder, corners };
    },
    'sso-sign-in': (body) => {
        const google = textSetting(body.google);
        return google ? { google } : null;
    },
    'alternate-sign-in': (body) => {
        const email = textSetting(body.email);
        const guest = textSetting(body.guest);
        return email && guest ? { email, guest } : null;
    },
    'footer': (body) => {
        const copyright = textSetting(body.copyright);
        const background = colorSetting(body.background);
        const { showPoweredBy } = body;
        if (!copyright || !background || typeof showPoweredBy !== 'boolean') {
            return null;
        }
        return { copyright, showPoweredBy, background };
    },
    'url-configuration': (body) => {
        const { slug } = body;
        if (typeof slug !== 'string' || (slug !== '' && !SLUG_PATTERN.test(slug))) {
            return null;
        }
        return { slug };
    },
};

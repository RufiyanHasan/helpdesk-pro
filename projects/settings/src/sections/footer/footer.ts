import { colorToSave, type ColorSetting } from '../../lib/colors';
import { initialTextSetting, type TextDefaults, type TextSetting } from '../../lib/text';
import { DISTRICT_NAME_DEFAULTS } from '../page-text/page-text';

export interface Footer {
  copyright: TextSetting;
  showPoweredBy: boolean;
  background: ColorSetting;
}

export const FOOTER_BACKGROUND_DEFAULT = '#FFFFFF';

const COPYRIGHT_COLOR_DEFAULT = '#4B5563';

// The default copyright line follows the district name shown on the page.
export function copyrightDefaults(districtName: string): TextDefaults {
  return {
    text: `© ${new Date().getFullYear()} ${districtName}. All rights reserved.`,
    color: COPYRIGHT_COLOR_DEFAULT,
  };
}

export const INITIAL_FOOTER: Footer = {
  copyright: initialTextSetting(copyrightDefaults(DISTRICT_NAME_DEFAULTS.text)),
  showPoweredBy: true,
  background: { useCustom: false, customColor: FOOTER_BACKGROUND_DEFAULT },
};

// Returns null when a custom colour is still half-typed.
export function footerToSave(footer: Footer): Footer | null {
  const copyright = colorToSave(footer.copyright, COPYRIGHT_COLOR_DEFAULT);
  const background = colorToSave(footer.background, FOOTER_BACKGROUND_DEFAULT);
  return copyright && background ? { ...footer, copyright, background } : null;
}

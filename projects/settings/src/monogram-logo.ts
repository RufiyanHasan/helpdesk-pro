import { colorToSave, shownColor, type ColorSetting } from './colors';

export type BrandMark = 'monogram' | 'logo';

// The settings saved as JSON. The logo file is saved separately.
export interface MonogramLogo {
  show: BrandMark;
  useCustomLetters: boolean;
  customLetters: string;
  background: ColorSetting;
  letterColor: ColorSetting;
}

export interface LogoState {
  // A browser-only link to the logo, for showing it.
  url: string | null;
  // A newly chosen file that hasn't been uploaded yet.
  file: File | null;
  // True when the logo was chosen or removed since the last save.
  changed: boolean;
}

export const MONOGRAM_BACKGROUND_DEFAULT = '#3763E5';

export const MONOGRAM_LETTER_DEFAULT = '#FFFFFF';

export const MAX_MONOGRAM_LETTERS = 2;

export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export const MAX_LOGO_BYTES = 1024 * 1024;

export const INITIAL_MONOGRAM_LOGO: MonogramLogo = {
  show: 'monogram',
  useCustomLetters: false,
  customLetters: '',
  background: { useCustom: false, customColor: MONOGRAM_BACKGROUND_DEFAULT },
  letterColor: { useCustom: false, customColor: MONOGRAM_LETTER_DEFAULT },
};

export const NO_LOGO: LogoState = { url: null, file: null, changed: false };

// By default the monogram is the first letter of the district name shown on the page.
export function defaultLetters(districtName: string): string {
  return districtName.trim().charAt(0).toUpperCase();
}

export function shownMonogram(monogram: MonogramLogo, districtName: string) {
  return {
    letters: monogram.useCustomLetters ? monogram.customLetters : defaultLetters(districtName),
    background: shownColor(monogram.background, MONOGRAM_BACKGROUND_DEFAULT),
    color: shownColor(monogram.letterColor, MONOGRAM_LETTER_DEFAULT),
  };
}

// Returns null when a custom colour is still half-typed.
export function monogramLogoToSave(monogram: MonogramLogo): MonogramLogo | null {
  const background = colorToSave(monogram.background, MONOGRAM_BACKGROUND_DEFAULT);
  const letterColor = colorToSave(monogram.letterColor, MONOGRAM_LETTER_DEFAULT);
  return background && letterColor ? { ...monogram, background, letterColor } : null;
}

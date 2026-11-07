import { colorToSave, type ColorSetting } from './colors';

export type ButtonCorners = 'rounded' | 'square';

export interface PageAppearance {
  pageBackground: ColorSetting;
  cardBackground: ColorSetting;
  buttonCorners: ButtonCorners;
}

export const PAGE_BACKGROUND_DEFAULT = '#E5E7EB';

export const CARD_BACKGROUND_DEFAULT = '#F9FAFB';

export const INITIAL_PAGE_APPEARANCE: PageAppearance = {
  pageBackground: { useCustom: false, customColor: PAGE_BACKGROUND_DEFAULT },
  cardBackground: { useCustom: false, customColor: CARD_BACKGROUND_DEFAULT },
  buttonCorners: 'rounded',
};

// Returns null when a custom colour is still half-typed.
export function pageAppearanceToSave(appearance: PageAppearance): PageAppearance | null {
  const pageBackground = colorToSave(appearance.pageBackground, PAGE_BACKGROUND_DEFAULT);
  const cardBackground = colorToSave(appearance.cardBackground, CARD_BACKGROUND_DEFAULT);
  return pageBackground && cardBackground ? { ...appearance, pageBackground, cardBackground } : null;
}

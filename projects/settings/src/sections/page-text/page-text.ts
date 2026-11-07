import { colorToSave } from '../../lib/colors';
import { initialTextSetting, type TextDefaults, type TextSetting } from '../../lib/text';

export interface PageText {
  districtName: TextSetting;
  subtext: TextSetting;
}

export const DISTRICT_NAME_DEFAULTS: TextDefaults = { text: 'Laguna Beach School District', color: '#000000' };

export const SUBTEXT_DEFAULTS: TextDefaults = { text: 'Onflo Support Portal', color: '#73737F' };

export const INITIAL_PAGE_TEXT: PageText = {
  districtName: initialTextSetting(DISTRICT_NAME_DEFAULTS),
  subtext: initialTextSetting(SUBTEXT_DEFAULTS),
};

// Returns null when a custom colour is still half-typed.
export function pageTextToSave(pageText: PageText): PageText | null {
  const districtName = colorToSave(pageText.districtName, DISTRICT_NAME_DEFAULTS.color);
  const subtext = colorToSave(pageText.subtext, SUBTEXT_DEFAULTS.color);
  return districtName && subtext ? { districtName, subtext } : null;
}

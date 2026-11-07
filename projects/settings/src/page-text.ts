import { colorToSave, shownColor } from './colors';

export interface TextDefaults {
  text: string;
  color: string;
}

export interface TextSetting {
  show: boolean;
  useCustom: boolean;
  customText: string;
  customColor: string;
}

export interface PageText {
  districtName: TextSetting;
  subtext: TextSetting;
}

export const DISTRICT_NAME_DEFAULTS: TextDefaults = { text: 'Laguna Beach School District', color: '#000000' };

export const SUBTEXT_DEFAULTS: TextDefaults = { text: 'Onflo Support Portal', color: '#73737F' };

export const MAX_TEXT_LENGTH = 100;

// Custom values start as the defaults, so switching to Custom begins from what is already shown.
function initialSetting(defaults: TextDefaults): TextSetting {
  return { show: true, useCustom: false, customText: defaults.text, customColor: defaults.color };
}

export const INITIAL_PAGE_TEXT: PageText = {
  districtName: initialSetting(DISTRICT_NAME_DEFAULTS),
  subtext: initialSetting(SUBTEXT_DEFAULTS),
};

// What the preview shows.
export function shownText(setting: TextSetting, defaults: TextDefaults): TextDefaults {
  return {
    text: setting.useCustom ? setting.customText : defaults.text,
    color: shownColor(setting, defaults.color),
  };
}

// Returns null when a custom colour is still half-typed.
export function pageTextToSave(pageText: PageText): PageText | null {
  const districtName = colorToSave(pageText.districtName, DISTRICT_NAME_DEFAULTS.color);
  const subtext = colorToSave(pageText.subtext, SUBTEXT_DEFAULTS.color);
  return districtName && subtext ? { districtName, subtext } : null;
}

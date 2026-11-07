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

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Custom values start as the defaults, so switching to Custom begins from what is already shown.
function initialSetting(defaults: TextDefaults): TextSetting {
  return { show: true, useCustom: false, customText: defaults.text, customColor: defaults.color };
}

export const INITIAL_PAGE_TEXT: PageText = {
  districtName: initialSetting(DISTRICT_NAME_DEFAULTS),
  subtext: initialSetting(SUBTEXT_DEFAULTS),
};

// What the preview shows. A colour that is still being typed falls back to the default.
export function shownText(setting: TextSetting, defaults: TextDefaults): TextDefaults {
  if (!setting.useCustom) {
    return defaults;
  }
  return {
    text: setting.customText,
    color: HEX_COLOR.test(setting.customColor) ? setting.customColor : defaults.color,
  };
}

function settingToSave(setting: TextSetting, defaults: TextDefaults): TextSetting | null {
  if (HEX_COLOR.test(setting.customColor)) {
    return setting;
  }
  // The server only accepts full colour codes. An unused custom colour can go back to the default.
  return setting.useCustom ? null : { ...setting, customColor: defaults.color };
}

// Returns null when a custom colour is still half-typed.
export function pageTextToSave(pageText: PageText): PageText | null {
  const districtName = settingToSave(pageText.districtName, DISTRICT_NAME_DEFAULTS);
  const subtext = settingToSave(pageText.subtext, SUBTEXT_DEFAULTS);
  return districtName && subtext ? { districtName, subtext } : null;
}

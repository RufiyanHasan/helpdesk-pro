import { shownColor } from './colors';

export interface TextDefaults {
  text: string;
  color: string;
}

// Text that can be hidden, with Default or Custom wording and colour.
export interface TextSetting {
  show: boolean;
  useCustom: boolean;
  customText: string;
  customColor: string;
}

export const MAX_TEXT_LENGTH = 100;

// Custom values start as the defaults, so switching to Custom begins from what is already shown.
export function initialTextSetting(defaults: TextDefaults): TextSetting {
  return { show: true, useCustom: false, customText: defaults.text, customColor: defaults.color };
}

// What the preview shows.
export function shownText(setting: TextSetting, defaults: TextDefaults): TextDefaults {
  return {
    text: setting.useCustom ? setting.customText : defaults.text,
    color: shownColor(setting, defaults.color),
  };
}

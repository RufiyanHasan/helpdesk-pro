export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export interface ColorSetting {
  useCustom: boolean;
  customColor: string;
}

// What the preview shows. A colour that is still being typed falls back to the default.
export function shownColor(setting: ColorSetting, defaultColor: string): string {
  return setting.useCustom && HEX_COLOR.test(setting.customColor) ? setting.customColor : defaultColor;
}

// The server only accepts full colour codes. Returns null when a custom colour is still half-typed,
// and puts an unused custom colour back to the default.
export function colorToSave<T extends ColorSetting>(setting: T, defaultColor: string): T | null {
  if (HEX_COLOR.test(setting.customColor)) {
    return setting;
  }
  return setting.useCustom ? null : { ...setting, customColor: defaultColor };
}

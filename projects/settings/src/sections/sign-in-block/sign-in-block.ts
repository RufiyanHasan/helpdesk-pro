import { colorToSave, type ColorSetting } from '../../lib/colors';
import type { Corners } from '../../lib/corners';
import { initialTextSetting, type TextDefaults, type TextSetting } from '../../lib/text';

// The white card around the sign-in options. The options themselves belong to the SSO and
// Alternate Sign-in Options sections.
export interface SignInBlock {
  heading: TextSetting;
  cardBackground: ColorSetting;
  showBorder: boolean;
  corners: Corners;
}

export const HEADING_DEFAULTS: TextDefaults = { text: 'Sign in to continue', color: '#111827' };

export const SIGN_IN_CARD_DEFAULT = '#FFFFFF';

export const INITIAL_SIGN_IN_BLOCK: SignInBlock = {
  heading: initialTextSetting(HEADING_DEFAULTS),
  cardBackground: { useCustom: false, customColor: SIGN_IN_CARD_DEFAULT },
  showBorder: true,
  corners: 'rounded',
};

// Returns null when a custom colour is still half-typed.
export function signInBlockToSave(block: SignInBlock): SignInBlock | null {
  const heading = colorToSave(block.heading, HEADING_DEFAULTS.color);
  const cardBackground = colorToSave(block.cardBackground, SIGN_IN_CARD_DEFAULT);
  return heading && cardBackground ? { ...block, heading, cardBackground } : null;
}

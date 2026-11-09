import { colorToSave } from '../../lib/colors';
import { initialTextSetting, type TextDefaults, type TextSetting } from '../../lib/text';

export interface SsoSignIn {
  google: TextSetting;
}

export const GOOGLE_DEFAULTS: TextDefaults = { text: 'Sign in with Google', color: '#1F1F1F' };

// Hidden until a user turns it on, so existing pages keep their current look.
export const INITIAL_SSO_SIGN_IN: SsoSignIn = {
  google: { ...initialTextSetting(GOOGLE_DEFAULTS), show: false },
};

// Returns null when a custom colour is still half-typed.
export function ssoSignInToSave(sso: SsoSignIn): SsoSignIn | null {
  const google = colorToSave(sso.google, GOOGLE_DEFAULTS.color);
  return google ? { google } : null;
}

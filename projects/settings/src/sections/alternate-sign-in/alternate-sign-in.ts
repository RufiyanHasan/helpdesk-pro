import { colorToSave } from '../../lib/colors';
import { initialTextSetting, type TextDefaults, type TextSetting } from '../../lib/text';

export interface AlternateSignIn {
  email: TextSetting;
  guest: TextSetting;
}

export const EMAIL_DEFAULTS: TextDefaults = { text: 'Sign in with Email', color: '#111827' };

export const GUEST_DEFAULTS: TextDefaults = { text: 'Continue as Guest', color: '#4B5563' };

export const INITIAL_ALTERNATE_SIGN_IN: AlternateSignIn = {
  email: initialTextSetting(EMAIL_DEFAULTS),
  guest: initialTextSetting(GUEST_DEFAULTS),
};

// Returns null when a custom colour is still half-typed.
export function alternateSignInToSave(options: AlternateSignIn): AlternateSignIn | null {
  const email = colorToSave(options.email, EMAIL_DEFAULTS.color);
  const guest = colorToSave(options.guest, GUEST_DEFAULTS.color);
  return email && guest ? { email, guest } : null;
}

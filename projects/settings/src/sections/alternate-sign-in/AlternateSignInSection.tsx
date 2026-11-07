import { EMAIL_DEFAULTS, GUEST_DEFAULTS, type AlternateSignIn } from './alternate-sign-in';
import TextGroup from '../../components/TextGroup';

interface AlternateSignInSectionProps {
  value: AlternateSignIn;
  onChange: (value: AlternateSignIn) => void;
}

export default function AlternateSignInSection({ value, onChange }: AlternateSignInSectionProps) {
  return (
    <div className="page-text">
      <TextGroup
        id="email-sign-in"
        showLabel='Show "Sign in with Email"'
        fieldLabel="Button text"
        defaults={EMAIL_DEFAULTS}
        setting={value.email}
        onChange={(changes) => onChange({ ...value, email: { ...value.email, ...changes } })}
      />
      <TextGroup
        id="guest-sign-in"
        showLabel='Show "Continue as Guest"'
        fieldLabel="Button text"
        defaults={GUEST_DEFAULTS}
        setting={value.guest}
        onChange={(changes) => onChange({ ...value, guest: { ...value.guest, ...changes } })}
      />
    </div>
  );
}

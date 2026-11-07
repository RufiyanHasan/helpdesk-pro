import TextGroup from '../../components/TextGroup';
import { GOOGLE_DEFAULTS, type SsoSignIn } from './sso-sign-in';

interface SsoSignInSectionProps {
  value: SsoSignIn;
  onChange: (value: SsoSignIn) => void;
}

export default function SsoSignInSection({ value, onChange }: SsoSignInSectionProps) {
  return (
    <div className="page-text">
      <TextGroup
        id="google-sign-in"
        showLabel="Show Google sign-in"
        fieldLabel="Button text"
        defaults={GOOGLE_DEFAULTS}
        setting={value.google}
        onChange={(changes) => onChange({ ...value, google: { ...value.google, ...changes } })}
      />
    </div>
  );
}

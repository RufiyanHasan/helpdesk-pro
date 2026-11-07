import ColorGroup from '../../components/ColorGroup';
import { CORNER_OPTIONS } from '../../lib/corners';
import { HEADING_DEFAULTS, SIGN_IN_CARD_DEFAULT, type SignInBlock } from './sign-in-block';
import TextGroup from '../../components/TextGroup';

interface SignInBlockSectionProps {
  value: SignInBlock;
  onChange: (value: SignInBlock) => void;
}

export default function SignInBlockSection({ value, onChange }: SignInBlockSectionProps) {
  return (
    <div className="page-appearance">
      <TextGroup
        id="sign-in-heading"
        showLabel="Show heading"
        fieldLabel="Heading text"
        defaults={HEADING_DEFAULTS}
        setting={value.heading}
        onChange={(changes) => onChange({ ...value, heading: { ...value.heading, ...changes } })}
      />
      <ColorGroup
        id="sign-in-card-background"
        label="Card background"
        defaultColor={SIGN_IN_CARD_DEFAULT}
        setting={value.cardBackground}
        onChange={(changes) => onChange({ ...value, cardBackground: { ...value.cardBackground, ...changes } })}
      />
      <div className="text-group">
        <label className="choice">
          <input
            type="checkbox"
            checked={value.showBorder}
            onChange={(event) => onChange({ ...value, showBorder: event.target.checked })}
          />
          Show card border
        </label>
      </div>
      <div className="text-group">
        <span className="field-label">Card corners</span>
        <div className="choice-row">
          {CORNER_OPTIONS.map((option) => (
            <label className="choice" key={option.value}>
              <input
                type="radio"
                name="sign-in-card-corners"
                checked={value.corners === option.value}
                onChange={() => onChange({ ...value, corners: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

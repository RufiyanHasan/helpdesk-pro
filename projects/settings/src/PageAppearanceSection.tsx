import ColorField from './ColorField';
import { shownColor, type ColorSetting } from './colors';
import {
  CARD_BACKGROUND_DEFAULT,
  PAGE_BACKGROUND_DEFAULT,
  type ButtonCorners,
  type PageAppearance,
} from './page-appearance';

interface ColorGroupProps {
  id: string;
  label: string;
  defaultColor: string;
  setting: ColorSetting;
  onChange: (changes: Partial<ColorSetting>) => void;
}

function ColorGroup({ id, label, defaultColor, setting, onChange }: ColorGroupProps) {
  const isCustom = setting.useCustom;

  return (
    <div className="text-group">
      <span className="field-label">{label}</span>
      <div className="choice-row">
        <label className="choice">
          <input type="radio" name={`${id}-mode`} checked={!isCustom} onChange={() => onChange({ useCustom: false })} />
          Default
        </label>
        <label className="choice">
          <input type="radio" name={`${id}-mode`} checked={isCustom} onChange={() => onChange({ useCustom: true })} />
          Custom
        </label>
      </div>
      <ColorField
        label={label}
        value={isCustom ? setting.customColor : defaultColor}
        color={shownColor(setting, defaultColor)}
        disabled={!isCustom}
        onChange={(customColor) => onChange({ customColor })}
      />
    </div>
  );
}

const BUTTON_CORNER_OPTIONS: { value: ButtonCorners; label: string }[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
];

interface PageAppearanceSectionProps {
  value: PageAppearance;
  onChange: (value: PageAppearance) => void;
}

export default function PageAppearanceSection({ value, onChange }: PageAppearanceSectionProps) {
  return (
    <div className="page-appearance">
      <ColorGroup
        id="page-background"
        label="Page background"
        defaultColor={PAGE_BACKGROUND_DEFAULT}
        setting={value.pageBackground}
        onChange={(changes) => onChange({ ...value, pageBackground: { ...value.pageBackground, ...changes } })}
      />
      <ColorGroup
        id="card-background"
        label="Card background"
        defaultColor={CARD_BACKGROUND_DEFAULT}
        setting={value.cardBackground}
        onChange={(changes) => onChange({ ...value, cardBackground: { ...value.cardBackground, ...changes } })}
      />
      <div className="text-group">
        <span className="field-label">Button corners</span>
        <div className="choice-row">
          {BUTTON_CORNER_OPTIONS.map((option) => (
            <label className="choice" key={option.value}>
              <input
                type="radio"
                name="button-corners"
                checked={value.buttonCorners === option.value}
                onChange={() => onChange({ ...value, buttonCorners: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

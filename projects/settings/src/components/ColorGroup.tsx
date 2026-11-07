import ColorField from './ColorField';
import { shownColor, type ColorSetting } from '../lib/colors';

interface ColorGroupProps {
  id: string;
  label: string;
  defaultColor: string;
  setting: ColorSetting;
  onChange: (changes: Partial<ColorSetting>) => void;
}

// A colour with a Default or Custom choice.
export default function ColorGroup({ id, label, defaultColor, setting, onChange }: ColorGroupProps) {
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

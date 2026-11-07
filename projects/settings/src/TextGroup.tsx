import ColorField from './ColorField';
import { MAX_TEXT_LENGTH, shownText, type TextDefaults, type TextSetting } from './page-text';

interface TextGroupProps {
  id: string;
  showLabel: string;
  fieldLabel: string;
  defaults: TextDefaults;
  setting: TextSetting;
  onChange: (changes: Partial<TextSetting>) => void;
}

// Text that can be hidden, with Default or Custom wording and colour. Used by Page Text and the Sign-in Block heading.
export default function TextGroup({ id, showLabel, fieldLabel, defaults, setting, onChange }: TextGroupProps) {
  const isCustom = setting.useCustom;
  const { color } = shownText(setting, defaults);

  return (
    <div className="text-group">
      <label className="choice">
        <input type="checkbox" checked={setting.show} onChange={(event) => onChange({ show: event.target.checked })} />
        {showLabel}
      </label>

      {/* The rest of the controls only matter while the text is shown. */}
      <fieldset className="text-group__fields" disabled={!setting.show}>
        <div className="choice-row">
          <label className="choice">
            <input
              type="radio"
              name={`${id}-mode`}
              checked={!isCustom}
              onChange={() => onChange({ useCustom: false })}
            />
            Default
          </label>
          <label className="choice">
            <input type="radio" name={`${id}-mode`} checked={isCustom} onChange={() => onChange({ useCustom: true })} />
            Custom
          </label>
        </div>

        <label className="field-label" htmlFor={`${id}-text`}>
          {fieldLabel}
        </label>
        <input
          className="text-input"
          id={`${id}-text`}
          type="text"
          value={isCustom ? setting.customText : defaults.text}
          disabled={!isCustom}
          maxLength={MAX_TEXT_LENGTH}
          onChange={(event) => onChange({ customText: event.target.value })}
        />

        <span className="color-label">Text Color</span>
        <ColorField
          label={`${fieldLabel} color`}
          value={isCustom ? setting.customColor : defaults.color}
          color={color}
          disabled={!isCustom}
          onChange={(customColor) => onChange({ customColor })}
        />
      </fieldset>
    </div>
  );
}

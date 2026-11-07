import {
  DISTRICT_NAME_DEFAULTS,
  shownText,
  SUBTEXT_DEFAULTS,
  type PageText,
  type TextDefaults,
  type TextSetting,
} from './page-text';

interface TextGroupProps {
  id: string;
  showLabel: string;
  fieldLabel: string;
  defaults: TextDefaults;
  setting: TextSetting;
  onChange: (changes: Partial<TextSetting>) => void;
}

// The district name and the subtext use the same set of controls.
function TextGroup({ id, showLabel, fieldLabel, defaults, setting, onChange }: TextGroupProps) {
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
          onChange={(event) => onChange({ customText: event.target.value })}
        />

        <span className="color-label">Text Color</span>
        <div className="color-row">
          <input
            className="color-swatch"
            type="color"
            value={color.toLowerCase()}
            disabled={!isCustom}
            aria-label={`${fieldLabel} color picker`}
            onChange={(event) => onChange({ customColor: event.target.value.toUpperCase() })}
          />
          <input
            className="text-input"
            type="text"
            value={isCustom ? setting.customColor : defaults.color}
            disabled={!isCustom}
            maxLength={7}
            aria-label={`${fieldLabel} color`}
            onChange={(event) => onChange({ customColor: event.target.value })}
          />
        </div>
      </fieldset>
    </div>
  );
}

interface PageTextSectionProps {
  value: PageText;
  onChange: (value: PageText) => void;
}

export default function PageTextSection({ value, onChange }: PageTextSectionProps) {
  return (
    <div className="page-text">
      <TextGroup
        id="district-name"
        showLabel="Show district name"
        fieldLabel="District name text"
        defaults={DISTRICT_NAME_DEFAULTS}
        setting={value.districtName}
        onChange={(changes) => onChange({ ...value, districtName: { ...value.districtName, ...changes } })}
      />
      <TextGroup
        id="subtext"
        showLabel="Show subtext"
        fieldLabel="Subtext"
        defaults={SUBTEXT_DEFAULTS}
        setting={value.subtext}
        onChange={(changes) => onChange({ ...value, subtext: { ...value.subtext, ...changes } })}
      />
    </div>
  );
}

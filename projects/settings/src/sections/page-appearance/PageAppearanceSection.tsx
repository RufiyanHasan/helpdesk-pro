import ColorGroup from '../../components/ColorGroup';
import { CORNER_OPTIONS } from '../../lib/corners';
import { CARD_BACKGROUND_DEFAULT, PAGE_BACKGROUND_DEFAULT, type PageAppearance } from './page-appearance';

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
          {CORNER_OPTIONS.map((option) => (
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

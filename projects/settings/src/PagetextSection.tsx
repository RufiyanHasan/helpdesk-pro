import { DISTRICT_NAME_DEFAULTS, SUBTEXT_DEFAULTS, type PageText } from './page-text';
import TextGroup from './TextGroup';

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

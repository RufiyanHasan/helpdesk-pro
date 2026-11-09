import ColorGroup from '../../components/ColorGroup';
import { copyrightDefaults, FOOTER_BACKGROUND_DEFAULT, type Footer } from './footer';
import TextGroup from '../../components/TextGroup';

interface FooterSectionProps {
  value: Footer;
  districtName: string;
  onChange: (value: Footer) => void;
}

export default function FooterSection({ value, districtName, onChange }: FooterSectionProps) {
  return (
    <div className="page-appearance">
      <TextGroup
        id="footer-copyright"
        showLabel="Show copyright"
        fieldLabel="Copyright text"
        defaults={copyrightDefaults(districtName)}
        setting={value.copyright}
        onChange={(changes) => onChange({ ...value, copyright: { ...value.copyright, ...changes } })}
      />
      <div className="text-group">
        <label className="choice">
          <input
            type="checkbox"
            checked={value.showPoweredBy}
            onChange={(event) => onChange({ ...value, showPoweredBy: event.target.checked })}
          />
          Show "Powered by onflo"
        </label>
      </div>
      <ColorGroup
        id="footer-background"
        label="Footer background"
        defaultColor={FOOTER_BACKGROUND_DEFAULT}
        setting={value.background}
        onChange={(changes) => onChange({ ...value, background: { ...value.background, ...changes } })}
      />
    </div>
  );
}

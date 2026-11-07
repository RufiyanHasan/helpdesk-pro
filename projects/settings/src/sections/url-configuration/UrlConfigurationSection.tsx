import { isValidSlug, MAX_SLUG_LENGTH, toSlug, VANITY_BASE_URL, type UrlConfiguration } from './url-configuration';

interface UrlConfigurationSectionProps {
  value: UrlConfiguration;
  onChange: (value: UrlConfiguration) => void;
}

export default function UrlConfigurationSection({ value, onChange }: UrlConfigurationSectionProps) {
  const isValid = isValidSlug(value.slug);

  return (
    <div className="page-appearance">
      <div className="text-group">
        <label className="field-label" htmlFor="page-url">
          Page URL
        </label>
        <div className="url-field">
          <span className="url-field__base">{VANITY_BASE_URL}</span>
          <input
            className="text-input url-field__input"
            id="page-url"
            type="text"
            placeholder="your-district"
            value={value.slug}
            maxLength={MAX_SLUG_LENGTH}
            onChange={(event) => onChange({ slug: toSlug(event.target.value) })}
          />
        </div>
        {isValid ? (
          <p className="logo-upload__hint">
            {value.slug ? `Your page will be at ${VANITY_BASE_URL}${value.slug}` : 'No address chosen yet.'}
          </p>
        ) : (
          <p className="logo-upload__error">Use 3 to 40 letters, numbers or hyphens, not starting or ending with a hyphen.</p>
        )}
      </div>
    </div>
  );
}

import { useState, type ChangeEvent } from 'react';
import ColorGroup from '../../components/ColorGroup';
import {
  defaultLetters,
  LOGO_TYPES,
  MAX_LOGO_BYTES,
  MAX_MONOGRAM_LETTERS,
  MONOGRAM_BACKGROUND_DEFAULT,
  MONOGRAM_LETTER_DEFAULT,
  type BrandMark,
  type LogoState,
  type MonogramLogo,
} from './monogram-logo';

const SHOW_OPTIONS: { value: BrandMark; label: string }[] = [
  { value: 'monogram', label: 'Monogram' },
  { value: 'logo', label: 'Logo' },
];

interface MonogramLogoSectionProps {
  value: MonogramLogo;
  logo: LogoState;
  districtName: string;
  onChange: (value: MonogramLogo) => void;
  onLogoChange: (logo: LogoState) => void;
}

export default function MonogramLogoSection({
  value,
  logo,
  districtName,
  onChange,
  onLogoChange,
}: MonogramLogoSectionProps) {
  const [logoError, setLogoError] = useState('');

  function chooseLogo(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    // Clearing the input lets the same file be chosen again after removing it.
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError('Choose a PNG, JPG or SVG file.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('Choose a file of 1 MB or less.');
      return;
    }
    setLogoError('');
    replaceLogo(file);
  }

  // The new file, or the removal, is only sent to the server on Save.
  function replaceLogo(file: File | null): void {
    // Frees the old file from memory before switching to the new one.
    if (logo.url) {
      URL.revokeObjectURL(logo.url);
    }
    onLogoChange({ url: file ? URL.createObjectURL(file) : null, file, changed: true });
  }

  return (
    <div className="page-appearance">
      <div className="text-group">
        <span className="field-label">Show</span>
        <div className="choice-row">
          {SHOW_OPTIONS.map((option) => (
            <label className="choice" key={option.value}>
              <input
                type="radio"
                name="brand-mark"
                checked={value.show === option.value}
                onChange={() => onChange({ ...value, show: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {value.show === 'monogram' ? (
        <>
          <div className="text-group">
            <span className="field-label">Letters</span>
            <div className="choice-row">
              <label className="choice">
                <input
                  type="radio"
                  name="monogram-letters"
                  checked={!value.useCustomLetters}
                  onChange={() => onChange({ ...value, useCustomLetters: false })}
                />
                Default
              </label>
              <label className="choice">
                <input
                  type="radio"
                  name="monogram-letters"
                  checked={value.useCustomLetters}
                  onChange={() => onChange({ ...value, useCustomLetters: true })}
                />
                Custom
              </label>
            </div>
            <input
              className="text-input"
              type="text"
              aria-label="Monogram letters"
              value={value.useCustomLetters ? value.customLetters : defaultLetters(districtName)}
              disabled={!value.useCustomLetters}
              maxLength={MAX_MONOGRAM_LETTERS}
              onChange={(event) => onChange({ ...value, customLetters: event.target.value.toUpperCase() })}
            />
          </div>
          <ColorGroup
            id="monogram-background"
            label="Background colour"
            defaultColor={MONOGRAM_BACKGROUND_DEFAULT}
            setting={value.background}
            onChange={(changes) => onChange({ ...value, background: { ...value.background, ...changes } })}
          />
          <ColorGroup
            id="monogram-letter-color"
            label="Letter colour"
            defaultColor={MONOGRAM_LETTER_DEFAULT}
            setting={value.letterColor}
            onChange={(changes) => onChange({ ...value, letterColor: { ...value.letterColor, ...changes } })}
          />
        </>
      ) : (
        <div className="text-group">
          <span className="field-label">Logo</span>
          {logo.url ? (
            <div className="logo-upload__current">
              <img className="logo-upload__thumbnail" src={logo.url} alt="Uploaded logo" />
              <button className="logo-upload__remove" type="button" onClick={() => replaceLogo(null)}>
                Remove
              </button>
            </div>
          ) : (
            <p className="logo-upload__hint">No logo yet. The monogram shows until you add one.</p>
          )}
          <label className="button button--secondary logo-upload__button">
            {logo.url ? 'Replace logo' : 'Upload logo'}
            <input className="logo-upload__input" type="file" accept={LOGO_TYPES.join(',')} onChange={chooseLogo} />
          </label>
          <p className="logo-upload__hint">PNG, JPG or SVG, up to 1 MB.</p>
          {logoError && <p className="logo-upload__error">{logoError}</p>}
        </div>
      )}
    </div>
  );
}

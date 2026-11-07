interface ColorFieldProps {
  label: string;
  // What is typed in the hex field, which may be half-typed.
  value: string;
  // A full colour code for the picker.
  color: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export default function ColorField({ label, value, color, disabled, onChange }: ColorFieldProps) {
  return (
    <div className="color-row">
      <input
        className="color-swatch"
        type="color"
        value={color.toLowerCase()}
        disabled={disabled}
        aria-label={`${label} picker`}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
      />
      <input
        className="text-input"
        type="text"
        value={value}
        disabled={disabled}
        maxLength={7}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

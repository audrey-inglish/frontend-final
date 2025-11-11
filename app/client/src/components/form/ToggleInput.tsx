import { useEffect, useRef } from "react";

interface ToggleInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function ToggleInput({
  label,
  checked,
  onChange,
  className = "",
}: ToggleInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = checked;
    }
  }, [checked]);

  return (
    <div className={`mb-4 flex items-center ${className}`}>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
}
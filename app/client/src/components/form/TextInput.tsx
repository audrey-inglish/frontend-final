import { useEffect, useRef } from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  type?: "text" | "email" | "password" | "url";
  className?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoFocus = false,
  type = "text",
  className = "",
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // This runs after the component mounts and when autoFocus changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-input"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

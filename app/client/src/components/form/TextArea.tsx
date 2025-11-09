import { useEffect, useRef } from "react";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  rows?: number;
  className?: string;
}

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoFocus = false,
  rows = 3,
  className = "",
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-input ${className}`}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </div>
  );
}

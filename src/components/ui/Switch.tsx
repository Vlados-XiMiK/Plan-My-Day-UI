"use client";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export default function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
        checked ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-600"
      } ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
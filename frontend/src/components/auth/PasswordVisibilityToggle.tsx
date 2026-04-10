"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function PasswordVisibilityToggle({
  isVisible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label={isVisible ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {isVisible ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );
}

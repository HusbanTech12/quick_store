import { forwardRef, type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface AuthFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
}

const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({ label, icon, error, rightElement, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border ${
              error
                ? "border-rose-300 dark:border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500"
                : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30 focus:border-indigo-500"
            } rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
              icon ? "pl-12" : ""
            } ${rightElement ? "pr-12" : ""} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            id={`${inputId}-error`}
            className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5"
            role="alert"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

AuthFormInput.displayName = "AuthFormInput";

export default AuthFormInput;

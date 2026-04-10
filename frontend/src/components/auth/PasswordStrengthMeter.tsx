"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

interface Criterion {
  label: string;
  met: boolean;
}

function evaluatePassword(password: string): {
  score: number;
  level: "weak" | "fair" | "good" | "strong";
  color: string;
  criteria: Criterion[];
} {
  const criteria: Criterion[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  let level: "weak" | "fair" | "good" | "strong";
  let color: string;

  if (score <= 1) {
    level = "weak";
    color = "from-rose-500 to-red-500";
  } else if (score <= 2) {
    level = "fair";
    color = "from-amber-500 to-orange-500";
  } else if (score <= 3) {
    level = "good";
    color = "from-blue-500 to-indigo-500";
  } else {
    level = "strong";
    color = "from-emerald-500 to-teal-500";
  }

  return { score, level, color, criteria };
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, level, color, criteria } = useMemo(
    () => evaluatePassword(password),
    [password]
  );

  if (!password) return null;

  const barSegments = 4;
  const filledSegments = Math.min(score, barSegments);

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Password Strength
          </span>
          <span className={`text-xs font-semibold capitalize bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {level}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: barSegments }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                background: i < filledSegments ? `linear-gradient(to right, var(--tw-gradient-stops))` : "transparent",
              }}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < filledSegments
                  ? `bg-gradient-to-r ${color}`
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {criteria.map((criterion) => (
          <div
            key={criterion.label}
            className="flex items-center gap-2 text-xs"
          >
            {criterion.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
            <span
              className={
                criterion.met
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { FC, useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    border: "border-l-4 border-green-500",
    icon: "text-green-600 dark:text-green-400",
    glow: "shadow-lg shadow-green-500/10",
  },
  error: {
    bg: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    border: "border-l-4 border-red-500",
    icon: "text-red-600 dark:text-red-400",
    glow: "shadow-lg shadow-red-500/10",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
    border: "border-l-4 border-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    glow: "shadow-lg shadow-amber-500/10",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    border: "border-l-4 border-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    glow: "shadow-lg shadow-blue-500/10",
  },
};

const ToastComponent: FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration === 0) return;

    const duration = toast.duration || 4000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [toast, onRemove]);

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative overflow-hidden
        flex items-start gap-3 p-4 rounded-xl
        ${style.bg} ${style.border} ${style.glow}
        backdrop-blur-sm
        transition-all duration-300 ease-out
        min-w-[320px] max-w-[420px]
        ${isExiting
          ? "opacity-0 translate-x-full scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-slide-in-right"
        }
      `}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            toast.type === "success" ? "bg-green-500" :
            toast.type === "error" ? "bg-red-500" :
            toast.type === "warning" ? "bg-amber-500" :
            "bg-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Icon with animated background */}
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 ${style.icon} opacity-20 blur-xl animate-pulse`} />
        <Icon className={`relative w-5 h-5 ${style.icon} mt-0.5`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
      </button>
    </div>
  );
};

export default ToastComponent;

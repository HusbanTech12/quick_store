"use client";

import { FC } from "react";
import { Check } from "lucide-react";

export interface CheckoutStep {
  number: number;
  title: string;
  description?: string;
}

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const CheckoutStepper: FC<CheckoutStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <nav aria-label="Checkout progress" className="mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <div
              key={step.number}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 transform
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-100"
                        : isCurrent
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 scale-110"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"}
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.title}${
                    isCompleted ? " (completed)" : isCurrent ? " (current)" : ""
                  }`}
                >
                  {/* Animated ring for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75"></span>
                  )}

                  {isCompleted ? (
                    <Check className="w-6 h-6 relative z-10" />
                  ) : (
                    <span className="relative z-10">{step.number}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-semibold transition-colors
                      ${
                        isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    `}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className={`text-xs mt-1 hidden sm:block transition-colors ${
                      isCurrent
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 mb-8 relative">
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div
                    className={`
                      absolute inset-0 rounded-full transition-all duration-500 ease-out
                      ${
                        step.number < currentStep
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 w-full"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 w-0"
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default CheckoutStepper;

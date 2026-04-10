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
    <nav aria-label="Checkout progress" className="mb-8">
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
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${
                      isCompleted
                        ? "bg-success text-white"
                        : isCurrent
                        ? "bg-brand text-brand-foreground shadow-glow"
                        : "bg-muted text-muted-foreground"
                    }
                    ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.title}${
                    isCompleted ? " (completed)" : isCurrent ? " (current)" : ""
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${
                        isCompleted
                          ? "text-success"
                          : isCurrent
                          ? "text-brand font-semibold"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mb-8">
                  <div
                    className={`
                      h-full transition-all duration-300
                      ${
                        step.number < currentStep
                          ? "bg-success"
                          : "bg-muted"
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

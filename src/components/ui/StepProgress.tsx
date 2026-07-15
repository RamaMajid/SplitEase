"use client";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1 mb-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i < currentStep
                ? "bg-primary flex-1"
                : i === currentStep
                ? "bg-primary flex-[2]"
                : "bg-surface-container-high flex-1"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => (
          <span
            key={i}
            className={`text-[11px] font-semibold transition-colors ${
              i === currentStep
                ? "text-primary"
                : i < currentStep
                ? "text-on-secondary-container"
                : "text-on-surface-variant"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useApp } from "@/context/AppContext";

interface TopBarProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRight?: () => void;
}

export default function TopBar({ title, onBack, rightIcon, onRight }: TopBarProps) {
  const { dispatch } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Use internal screen stack — always goes to the actual previous screen
      dispatch({ type: "GO_BACK" });
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 w-full"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(249,249,255,0.88)" }}>
      <button
        onClick={handleBack}
        className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
        aria-label="Back"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 className="font-manrope font-bold text-[20px] text-primary">{title}</h1>
      {rightIcon ? (
        <button
          onClick={onRight}
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">{rightIcon}</span>
        </button>
      ) : (
        <div className="w-10 h-10" />
      )}
    </header>
  );
}

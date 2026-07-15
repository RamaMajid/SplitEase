"use client";
import { useApp } from "@/context/AppContext";
import { Screen } from "@/lib/store";

interface NavItem {
  screen: Screen;
  icon: string;
  iconFill: string;
  label: string;
}

const navItems: NavItem[] = [
  { screen: "home", icon: "home", iconFill: "home", label: "Home" },
  { screen: "history", icon: "history", iconFill: "history", label: "History" },
  { screen: "settings", icon: "settings", iconFill: "settings", label: "Settings" },
];

export default function BottomNav({ activeScreen }: { activeScreen: Screen }) {
  const { dispatch } = useApp();

  return (
    <nav className="bottom-nav flex justify-around items-center px-6 py-3 pb-4 rounded-t-3xl">
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <button
            key={item.screen}
            onClick={() => dispatch({ type: "NAVIGATE", screen: item.screen })}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive
                ? "text-on-secondary-container"
                : "text-on-surface-variant hover:opacity-80"
            }`}
            aria-label={item.label}
          >
            <div className={`px-5 py-1 rounded-full transition-colors duration-200 ${isActive ? "bg-secondary-container" : ""}`}>
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isActive ? item.iconFill : item.icon}
              </span>
            </div>
            <span className="text-[12px] font-semibold leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

"use client";
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from "react";
import { AppState, Action, initialState, reducer, HistoryEntry, Screen } from "@/lib/store";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Data version for migration ───────────────────────────────────────────────
const STORAGE_KEY = "splitease_history";
const VERSION_KEY = "splitease_data_version";
const CURRENT_VERSION = "3"; // v3 = AssignmentGroup model

/**
 * Migrate or discard old-format history entries.
 */
function migrateHistory(raw: unknown[]): HistoryEntry[] {
  const valid: HistoryEntry[] = [];
  for (const entry of raw) {
    const e = entry as Record<string, unknown>;
    if (!e || typeof e !== "object") continue;
    const items = e.items as Record<string, unknown>[] | undefined;
    if (!items || !Array.isArray(items)) continue;

    const hasNewFormat = items.every((item) => Array.isArray((item as Record<string, unknown>).assignmentGroups));
    if (!hasNewFormat) continue;

    valid.push(e as unknown as HistoryEntry);
  }
  return valid;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Flag: true when navigation was triggered by browser back/forward (popstate).
  // This prevents pushState from firing again and creating duplicate history entries.
  const isPopstateNav = useRef(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion !== CURRENT_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      const migrated = migrateHistory(parsed);
      if (migrated.length > 0) {
        dispatch({ type: "LOAD_HISTORY", history: migrated });
      }
    } catch {
      // Silently ignore storage errors
    }

    // Set initial browser history state
    window.history.replaceState({ screen: "home" }, "", "");
  }, []);

  // ── Push to browser history when screen changes (but NOT when triggered by back button) ──
  useEffect(() => {
    if (isPopstateNav.current) {
      // This screen change came from popstate — don't push again
      isPopstateNav.current = false;
      return;
    }
    // Only push if the screen actually differs from what's already in history
    const currentBrowserScreen = window.history.state?.screen;
    if (currentBrowserScreen !== state.currentScreen) {
      window.history.pushState({ screen: state.currentScreen }, "", "");
    }
  }, [state.currentScreen]);

  // ── Listen for browser back/forward button (popstate) ──
  const handlePopState = useCallback((e: PopStateEvent) => {
    const targetScreen = e.state?.screen as Screen | undefined;
    if (targetScreen) {
      isPopstateNav.current = true; // Mark: don't re-push this navigation
      dispatch({ type: "NAVIGATE", screen: targetScreen });
    } else {
      // No state (user went all the way back) — go home
      isPopstateNav.current = true;
      dispatch({ type: "NAVIGATE", screen: "home" });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

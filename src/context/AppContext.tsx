"use client";
import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { AppState, Action, initialState, reducer, HistoryEntry } from "@/lib/store";

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
  }, []);

  // ── Browser back button support ──
  // Push a dummy entry so pressing back triggers popstate instead of leaving the app
  useEffect(() => {
    // Push an initial entry so there's always something to go back to
    window.history.replaceState({ splitease: true }, "", "");
    window.history.pushState({ splitease: true }, "", "");
  }, []);

  // Listen for phone/browser back button
  const handlePopState = useCallback(() => {
    // When back is pressed, use our internal screen stack
    dispatch({ type: "GO_BACK" });
    // Re-push so the next back press also works (prevents leaving the app)
    window.history.pushState({ splitease: true }, "", "");
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

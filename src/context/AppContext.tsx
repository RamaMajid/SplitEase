"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
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
 * Old formats used `assignedTo`, `splitMode`, `assignedQty` on ReceiptItem.
 * New format uses `assignmentGroups`.
 */
function migrateHistory(raw: unknown[]): HistoryEntry[] {
  const valid: HistoryEntry[] = [];
  for (const entry of raw) {
    const e = entry as Record<string, unknown>;
    if (!e || typeof e !== "object") continue;
    const items = e.items as Record<string, unknown>[] | undefined;
    if (!items || !Array.isArray(items)) continue;

    // Check if items have the new format (assignmentGroups)
    const hasNewFormat = items.every((item) => Array.isArray((item as Record<string, unknown>).assignmentGroups));
    if (!hasNewFormat) continue; // skip incompatible old entries

    valid.push(e as unknown as HistoryEntry);
  }
  return valid;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      // Check data version — if outdated, clear storage
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion !== CURRENT_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        return; // no history to load
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

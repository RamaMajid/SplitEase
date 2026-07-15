"use client";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/ui/BottomNav";
import TopBar from "@/components/ui/TopBar";
import { formatIDR, HistoryEntry } from "@/lib/store";
import { useState } from "react";

export default function HistoryScreen() {
  const { state, dispatch } = useApp();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_HISTORY", id });
    setDeleteConfirm(null);
  };

  const handleView = (entry: HistoryEntry) => {
    dispatch({ type: "LOAD_FROM_HISTORY", entry });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(249,249,255,0.88)" }}>
        <div className="w-10" />
        <h1 className="font-manrope font-bold text-[20px] text-primary">Riwayat</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-4 pt-4 pb-32">
        {state.history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 36 }}>history</span>
            </div>
            <div className="text-center">
              <p className="font-manrope font-bold text-[18px] text-on-surface">Belum ada riwayat</p>
              <p className="text-[14px] text-on-surface-variant mt-1">Mulai split bill pertamamu!</p>
            </div>
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "home" })}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-semibold text-[14px] shadow-fab"
            >
              Mulai Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-manrope font-bold text-[24px] text-on-background">Semua Riwayat</h2>
              <span className="text-[13px] text-on-surface-variant">{state.history.length} entri</span>
            </div>

            {state.history.map((entry) => (
              <div
                key={entry.id}
                className="bg-tertiary-fixed/50 rounded-[20px] p-4 shadow-ambient animate-fade-in"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>restaurant</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px] text-on-surface">{entry.restaurantName}</h3>
                      <p className="text-[12px] text-on-surface-variant">
                        {entry.date} • {entry.participants.length} orang
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-manrope font-bold text-[16px] text-on-surface">{formatIDR(entry.grandTotal)}</p>
                  </div>
                </div>

                {/* Participants chips */}
                <div className="flex gap-1 flex-wrap mb-3">
                  {entry.participants.slice(0, 4).map((name, i) => (
                    <span key={i} className="text-[11px] font-semibold bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full">
                      {name}
                    </span>
                  ))}
                  {entry.participants.length > 4 && (
                    <span className="text-[11px] font-semibold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                      +{entry.participants.length - 4} lagi
                    </span>
                  )}
                </div>

                <div className="h-px bg-outline-variant/20 mb-3" />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleView(entry)}
                    className="flex items-center gap-1 text-primary text-[13px] font-semibold hover:underline"
                    id={`view-history-${entry.id}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                    Lihat
                  </button>
                  {deleteConfirm === entry.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-error text-[13px] font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        Yakin?
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-on-surface-variant text-[13px] font-semibold"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(entry.id)}
                      className="flex items-center gap-1 text-error text-[13px] font-semibold hover:underline"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeScreen="history" />
    </div>
  );
}

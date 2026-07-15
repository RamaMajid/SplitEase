"use client";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/ui/BottomNav";
import { formatIDR } from "@/lib/store";
import { useRef } from "react";

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({ type: "SET_IMAGE", image: ev.target?.result as string });
      dispatch({ type: "NAVIGATE", screen: "processing" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(249,249,255,0.88)" }}>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="SplitEase" width={32} height={32} className="rounded-full object-cover" />
          <span className="font-manrope font-bold text-[20px] text-primary">SplitEase</span>
        </div>
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "settings" })}
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 pt-6 pb-32 flex flex-col gap-8">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-4 mt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-fab">
              <Image src="/logo.png" alt="SplitEase Logo" width={96} height={96} className="object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: 18 }}>receipt_long</span>
            </div>
          </div>
          <div>
            <h1 className="font-manrope font-bold text-[28px] leading-[36px] text-on-background">
              Siap bagi-bagi tagihan?
            </h1>
            <p className="text-[14px] text-on-surface-variant mt-1 px-4 text-center">
              Scan nota, assign item ke teman, dan hitung bagian masing-masing dalam hitungan detik.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col gap-3">
          <button
            onClick={() => dispatch({ type: "NAVIGATE", screen: "scanner" })}
            className="w-full bg-primary text-on-primary rounded-[20px] py-4 px-6 flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-fab font-semibold text-[14px]"
            id="scan-receipt-btn"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            Scan Nota / Struk
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-[20px] py-4 px-6 flex items-center justify-center gap-3 active:scale-95 transition-transform font-semibold text-[14px] hover:bg-surface-container-low"
            id="upload-receipt-btn"
          >
            <span className="material-symbols-outlined">folder_open</span>
            Upload Foto Nota
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />

          <button
            onClick={() => {
              dispatch({ type: "RESET_SESSION" });
              dispatch({ type: "SET_RESTAURANT", name: "Input Manual", date: new Date().toLocaleDateString("id-ID") });
              dispatch({ type: "NAVIGATE", screen: "receipt-editor" });
            }}
            className="w-full text-primary text-[14px] font-semibold py-2 flex items-center justify-center gap-2 hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
            Input Manual
          </button>
        </section>

        {/* Recent Calculations */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-manrope font-bold text-[20px] text-on-background">Riwayat Terbaru</h2>
            {state.history.length > 0 && (
              <button
                onClick={() => dispatch({ type: "NAVIGATE", screen: "history" })}
                className="text-[12px] font-semibold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            )}
          </div>

          {state.history.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[20px] p-8 flex flex-col items-center gap-3 shadow-ambient">
              <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 28 }}>receipt_long</span>
              </div>
              <p className="text-[14px] text-on-surface-variant text-center">
                Belum ada riwayat. Mulai scan nota pertamamu!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {state.history.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => dispatch({ type: "LOAD_FROM_HISTORY", entry })}
                  className="bg-surface-container-lowest rounded-[20px] p-4 flex items-center justify-between shadow-ambient card-interactive"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[16px] text-on-background">{entry.restaurantName}</p>
                      <p className="text-[12px] text-on-surface-variant">
                        {entry.date} • {entry.participants.length} orang
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[16px] text-on-background">{formatIDR(entry.grandTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav activeScreen="home" />
    </div>
  );
}

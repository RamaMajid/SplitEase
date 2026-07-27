"use client";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import { formatIDR } from "@/lib/store";
import { useState } from "react";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function SummaryScreen() {
  const { state, dispatch } = useApp();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const grandTotal = state.results.reduce((sum, r) => sum + r.total, 0);
  const totalTax = state.results.reduce((sum, r) => sum + r.tax, 0);
  const totalService = state.results.reduce((sum, r) => sum + r.service, 0);

  const participant = state.participants.find((p) => p.id === (state.results[0]?.participantId));

  const handleCopy = async () => {
    const text = state.results
      .map(
        (r) =>
          `${r.participantName}: ${formatIDR(r.total)}\n` +
          r.items.map((i) => `  - ${i.name}: ${formatIDR(i.amount)}`).join("\n")
      )
      .join("\n\n");
    const full = `🍽️ ${state.restaurantName || "Split Bill"}\n\n${text}\n\n💰 Total: ${formatIDR(grandTotal)}`;
    await navigator.clipboard.writeText(full).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = state.results
      .map((r) => `${r.participantName}: ${formatIDR(r.total)}`)
      .join("\n");
    const full = `🍽️ ${state.restaurantName || "Split Bill"} — Total: ${formatIDR(grandTotal)}\n\n${text}`;
    if (navigator.share) {
      await navigator.share({ title: "SplitEase", text: full }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(full).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (!saved) {
      dispatch({ type: "SAVE_TO_HISTORY" });
      setSaved(true);
    }
  };

  const handleDone = () => {
    if (!saved) {
      dispatch({ type: "SAVE_TO_HISTORY" });
      setSaved(true);
    }
    dispatch({ type: "NAVIGATE", screen: "home" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Ringkasan Split" backScreen="tax-service" />

      <main className="flex-1 px-4 pt-4 pb-32 space-y-4">
        {/* Grand total card */}
        <div className="bg-primary rounded-[24px] p-6 text-center relative overflow-hidden shadow-fab animate-fade-in">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <p className="text-[12px] font-semibold text-on-primary/70 uppercase tracking-wider mb-1">Total Tagihan</p>
          <p className="font-manrope font-bold text-[36px] text-on-primary leading-none">{formatIDR(grandTotal)}</p>
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            {totalTax > 0 && (
              <span className="text-[12px] text-on-primary/70 bg-white/10 px-3 py-1 rounded-full">
                Pajak: {formatIDR(totalTax)}
              </span>
            )}
            {totalService > 0 && (
              <span className="text-[12px] text-on-primary/70 bg-white/10 px-3 py-1 rounded-full">
                Service: {formatIDR(totalService)}
              </span>
            )}
          </div>
          <p className="text-[13px] text-on-primary/60 mt-2">{state.restaurantName}</p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-highest text-on-surface rounded-[16px] hover:bg-surface-container-high active:scale-95 transition-all card-interactive"
            id="share-btn"
          >
            <span className="material-symbols-outlined text-primary">share</span>
            <span className="text-[12px] font-semibold">Share</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-highest text-on-surface rounded-[16px] hover:bg-surface-container-high active:scale-95 transition-all card-interactive"
            id="copy-btn"
          >
            <span className="material-symbols-outlined text-primary">{copied ? "check" : "content_copy"}</span>
            <span className="text-[12px] font-semibold">{copied ? "Tersalin!" : "Salin"}</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[16px] hover:opacity-90 active:scale-95 transition-all card-interactive ${
              saved ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-highest text-on-surface"
            }`}
            id="save-btn"
          >
            <span className="material-symbols-outlined text-primary">{saved ? "check_circle" : "save"}</span>
            <span className="text-[12px] font-semibold">{saved ? "Tersimpan" : "Simpan"}</span>
          </button>
        </div>

        {/* Per-person cards */}
        <section className="space-y-3">
          {state.results.map((result) => {
            const p = state.participants.find((pp) => pp.id === result.participantId);
            return (
              <div
                key={result.participantId}
                className="bg-tertiary-fixed text-on-tertiary-fixed rounded-[20px] p-4 shadow-ambient animate-fade-in"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
                      style={{ backgroundColor: p?.color || "#005e56" }}
                    >
                      {getInitials(result.participantName)}
                    </div>
                    <div>
                      <p className="font-manrope font-bold text-[18px] text-on-surface">{result.participantName}</p>
                      <p className="text-[12px] text-on-surface-variant">{result.items.length} item</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-on-surface-variant">Bayar</p>
                    <p className="font-manrope font-bold text-[22px] text-primary">{formatIDR(result.total)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[13px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        {item.shared && (
                          <span className="material-symbols-outlined text-on-surface-variant/60" style={{ fontSize: 12 }}>people</span>
                        )}
                        {item.name}
                        {item.shared && <span className="text-[10px] opacity-60">(1/{item.splitWith})</span>}
                      </span>
                      <span className="font-medium">{formatIDR(item.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="flex justify-between bg-surface-container-low p-2 rounded-xl text-[12px] text-on-surface-variant flex-wrap gap-2">
                  <span>Subtotal: {formatIDR(result.subtotal)}</span>
                  {result.tax > 0 && <span>Pajak: {formatIDR(result.tax)}</span>}
                  {result.service > 0 && <span>Service: {formatIDR(result.service)}</span>}
                </div>
              </div>
            );
          })}
        </section>

        {/* Logo branding */}
        <div className="flex justify-center py-4 opacity-60">
          <Image src="/logo.png" alt="SplitEase" width={40} height={40} className="rounded-full object-cover" />
        </div>
      </main>

      {/* Done button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 py-4 pb-6"
        style={{ background: "linear-gradient(to top, #f9f9ff, #f9f9ff 60%, transparent)" }}>
        <button
          onClick={handleDone}
          className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-[14px] shadow-fab hover:bg-surface-tint active:scale-95 transition-all flex items-center justify-center gap-2"
          id="done-btn"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Selesai
        </button>
      </div>
    </div>
  );
}

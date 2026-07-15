"use client";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { sampleReceiptData } from "@/lib/store";

export default function ProcessingScreen() {
  const { dispatch } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Load sample data to simulate OCR
      dispatch({ type: "SET_RESTAURANT", name: sampleReceiptData.restaurantName, date: sampleReceiptData.date });
      dispatch({ type: "SET_ITEMS", items: sampleReceiptData.items });
      dispatch({ type: "NAVIGATE", screen: "receipt-preview" });
    }, 2800);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] items-center justify-center px-4">
      {/* Scanner animation */}
      <div className="relative w-44 h-60 mb-10 flex items-center justify-center">
        {/* Glow */}
        <div className="absolute inset-0 bg-primary-container rounded-3xl opacity-20 animate-pulse-ring blur-xl" />
        {/* Receipt graphic */}
        <div className="relative w-36 h-52 bg-surface-container-lowest rounded-xl shadow-ambient flex flex-col items-center py-5 px-4 z-10">
          {/* Receipt lines */}
          <div className="w-14 h-1 bg-surface-variant rounded-full mb-4" />
          <div className="w-full h-2 bg-surface-variant rounded-full mb-3" />
          <div className="w-3/4 h-2 bg-surface-variant rounded-full mb-3 self-start" />
          <div className="w-5/6 h-2 bg-surface-variant rounded-full mb-3 self-start" />
          <div className="w-full h-2 bg-surface-variant rounded-full mb-3" />
          <div className="w-2/3 h-2 bg-surface-variant rounded-full mb-3 self-start" />
          <div className="h-px w-full bg-outline-variant my-2" />
          <div className="w-1/2 h-3 bg-secondary-container rounded-full mt-auto self-end" />
        </div>
        {/* Scanning ray */}
        <div
          className="absolute left-2 right-2 h-0.5 bg-primary rounded-full z-20"
          style={{
            animation: "scan 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
            position: "absolute",
            boxShadow: "0 0 14px rgba(0,94,86,0.7)",
          }}
        />
      </div>

      {/* Text */}
      <div className="text-center max-w-xs">
        <h2 className="font-manrope font-bold text-[22px] text-on-surface mb-2">Membaca nota...</h2>
        <p className="text-[14px] text-on-surface-variant">Kami sedang mengenali item dan harga secara otomatis.</p>
      </div>

      {/* Spinner */}
      <div className="mt-6">
        <div
          className="w-8 h-8 border-4 border-primary-container border-t-primary rounded-full animate-spin"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {["Membaca...", "Mengenali item...", "Memproses harga..."].map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-60" style={{ animationDelay: `${i * 0.3}s` }} />
            {i < 2 && <div className="w-4 h-px bg-outline-variant" />}
          </div>
        ))}
      </div>
    </div>
  );
}

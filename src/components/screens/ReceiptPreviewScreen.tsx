"use client";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import { formatIDR } from "@/lib/store";

export default function ReceiptPreviewScreen() {
  const { state, dispatch } = useApp();

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = state.taxService.taxEnabled ? subtotal * (state.taxService.taxRate / 100) : 0;
  const service = state.taxService.serviceEnabled ? subtotal * (state.taxService.serviceRate / 100) : 0;
  const total = subtotal + tax + service;

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Konfirmasi Detail" backScreen="scanner" />

      <main className="flex-1 px-4 pb-32 flex flex-col items-center pt-4">
        {/* Receipt Card */}
        <div className="w-full max-w-sm bg-surface-container-lowest rounded-t-3xl shadow-ambient overflow-visible">
          {/* Store header */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-dashed border-surface-container">
            <h2 className="font-manrope font-bold text-[20px] text-on-surface leading-tight">{state.restaurantName || "Warung Makan"}</h2>
            <p className="text-[13px] text-on-surface-variant mt-1">{state.receiptDate}</p>
          </div>

          {/* Items */}
          <div className="px-6 py-4 space-y-3 border-b border-dashed border-surface-container">
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-on-surface truncate">{item.name}</p>
                  <p className="text-[12px] text-on-surface-variant">{item.qty} x {formatIDR(item.price)}</p>
                </div>
                <p className="text-[14px] text-on-surface font-semibold whitespace-nowrap">{formatIDR(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 space-y-2">
            <div className="flex justify-between text-[14px] text-on-surface-variant">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-[14px] text-on-surface-variant">
                <span>Pajak ({state.taxService.taxRate}%)</span>
                <span>{formatIDR(tax)}</span>
              </div>
            )}
            {service > 0 && (
              <div className="flex justify-between text-[14px] text-on-surface-variant">
                <span>Service ({state.taxService.serviceRate}%)</span>
                <span>{formatIDR(service)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-surface-container">
              <span className="font-manrope font-bold text-[18px] text-on-surface">Total</span>
              <span className="font-manrope font-bold text-[24px] text-primary">{formatIDR(total)}</span>
            </div>
          </div>
        </div>

        {/* Torn edge decoration */}
        <div className="w-full max-w-sm receipt-edge" />

        {/* Edit button */}
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "receipt-editor" })}
          className="mt-6 flex items-center gap-2 text-primary font-semibold text-[14px] hover:opacity-80 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
          Edit Item
        </button>
      </main>

      {/* Continue button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4 py-4 pb-6"
        style={{ background: "linear-gradient(to top, #f9f9ff, #f9f9ff 70%, transparent)" }}>
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "participants" })}
          className="w-full h-14 bg-primary text-on-primary rounded-full shadow-fab flex items-center justify-center gap-2 font-semibold text-[14px] hover:bg-surface-tint active:scale-95 transition-all"
          id="continue-to-participants-btn"
        >
          Lanjut ke Split
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

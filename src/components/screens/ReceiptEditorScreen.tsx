"use client";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import { ReceiptItem, formatIDR } from "@/lib/store";
import { useState } from "react";

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function ReceiptEditorScreen() {
  const { state, dispatch } = useApp();
  const [restaurantName, setRestaurantName] = useState(state.restaurantName || "");
  const [items, setItems] = useState<ReceiptItem[]>(
    state.items.length > 0
      ? state.items
      : [{ id: generateId(), name: "", qty: 1, price: 0, assignmentGroups: [] }]
  );

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Auto-calculate price when qty changes (keep per-unit base)
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), name: "", qty: 1, price: 0, assignmentGroups: [] },
    ]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    const validItems = items.filter((i) => i.name.trim() && i.price > 0);
    dispatch({ type: "SET_RESTAURANT", name: restaurantName, date: state.receiptDate || new Date().toLocaleDateString("id-ID") });
    dispatch({ type: "SET_ITEMS", items: validItems });
    dispatch({ type: "NAVIGATE", screen: "participants" });
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Edit Item" backScreen="receipt-preview" />

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-36">
        {/* Restaurant name */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">
            Nama Restoran
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Nama warung / restoran"
            className="w-full h-12 rounded-xl bg-surface-container-low border-none px-4 text-[16px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Header */}
        <div className="grid grid-cols-[48px_1fr_90px_36px] gap-2 px-1 mb-2">
          <span className="text-[11px] font-semibold text-on-surface-variant text-center">Qty</span>
          <span className="text-[11px] font-semibold text-on-surface-variant">Item</span>
          <span className="text-[11px] font-semibold text-on-surface-variant text-right">Harga Satuan</span>
          <span />
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2" id="items-list">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-[48px_1fr_90px_36px] gap-2 items-center bg-surface-container-lowest rounded-xl p-2 shadow-card animate-fade-in"
            >
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateItem(item.id, "qty", parseInt(e.target.value) || 1)}
                className="w-full h-11 rounded-lg bg-surface-container-low border-none text-center text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Qty item ${idx + 1}`}
              />
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                placeholder="Nama item..."
                className="w-full h-11 rounded-lg bg-surface-container-low border-none px-3 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Nama item ${idx + 1}`}
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-on-surface-variant font-semibold">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={item.price || ""}
                  onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full h-11 rounded-lg bg-surface-container-low border-none pl-7 pr-1 text-right text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Harga item ${idx + 1}`}
                />
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-error/70 hover:text-error hover:bg-error-container/50 transition-colors"
                aria-label="Hapus item"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          onClick={addItem}
          className="mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-outline-variant text-primary font-semibold text-[14px] hover:bg-surface-container-low transition-colors active:scale-[0.98]"
          id="add-item-btn"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Tambah Item
        </button>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-surface-container-low flex flex-col gap-2">
          <div className="flex justify-between text-[14px] text-on-surface-variant">
            <span>Subtotal ({items.length} item)</span>
            <span className="font-semibold">{formatIDR(subtotal)}</span>
          </div>
          {state.taxService.taxEnabled && (
            <div className="flex justify-between text-[14px] text-on-surface-variant">
              <span>Pajak ({state.taxService.taxRate}%)</span>
              <span>{formatIDR(subtotal * state.taxService.taxRate / 100)}</span>
            </div>
          )}
          <div className="h-px bg-outline-variant/30 my-1" />
          <div className="flex justify-between font-manrope font-bold text-[18px] text-on-surface">
            <span>Total</span>
            <span className="text-primary">
              {formatIDR(subtotal * (1 + (state.taxService.taxEnabled ? state.taxService.taxRate / 100 : 0)))}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-[#f9f9ff]/90 backdrop-blur-md p-4 border-t border-outline-variant/20 rounded-t-3xl pb-6">
        <button
          onClick={handleSave}
          className="w-full h-14 bg-primary text-on-primary rounded-full font-semibold text-[14px] shadow-fab hover:bg-surface-tint active:scale-95 transition-all"
          id="save-continue-btn"
        >
          Simpan & Lanjutkan
        </button>
      </div>
    </div>
  );
}

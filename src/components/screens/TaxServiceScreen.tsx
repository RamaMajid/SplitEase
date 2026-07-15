"use client";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import StepProgress from "@/components/ui/StepProgress";
import { TaxServiceConfig, formatIDR, calculateSplit, getTotalAssignedQty } from "@/lib/store";
import { useState } from "react";

const steps = ["Scan", "Edit", "Peserta", "Assign", "Pajak", "Hasil"];

const taxPresets = [0, 10, 11, 12];
const servicePresets = [0, 5, 10, 15];

export default function TaxServiceScreen() {
  const { state, dispatch } = useApp();
  const [config, setConfig] = useState<TaxServiceConfig>(state.taxService);
  const [taxCustom, setTaxCustom] = useState(false);
  const [serviceCustom, setServiceCustom] = useState(false);

  // Subtotal = sum of what each group actually pays (unit price × group qty), across all items
  const subtotal = state.items.reduce((sum, item) => {
    const assignedTotal = item.assignmentGroups.reduce((s, g) => s + item.price * g.qty, 0);
    // If no groups assigned yet, fall back to item total (price × qty)
    return sum + (item.assignmentGroups.length > 0 ? assignedTotal : item.price * item.qty);
  }, 0);
  const tax = config.taxEnabled ? subtotal * (config.taxRate / 100) : 0;
  const service = config.serviceEnabled ? subtotal * (config.serviceRate / 100) : 0;
  const total = subtotal + tax + service;

  const handleCalculate = () => {
    dispatch({ type: "SET_TAX_SERVICE", config });
    const results = calculateSplit(state.items, state.participants, config);
    dispatch({ type: "SET_RESULTS", results });
    dispatch({ type: "NAVIGATE", screen: "summary" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Pajak & Service" backScreen="item-assignment" />
      <StepProgress steps={steps} currentStep={4} />

      <main className="flex-1 px-4 py-4 pb-36 space-y-4">
        {/* Tax section */}
        <section className="bg-surface-container-lowest rounded-[20px] p-4 shadow-ambient">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[16px] text-on-surface">Pajak (PPN)</h3>
              <p className="text-[12px] text-on-surface-variant">Pajak Pertambahan Nilai</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setConfig((c) => ({ ...c, taxEnabled: !c.taxEnabled }))}
              className={`toggle-track ${config.taxEnabled ? "active" : ""}`}
              role="switch"
              aria-checked={config.taxEnabled}
              id="tax-toggle"
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          {config.taxEnabled && (
            <div>
              <div className="flex bg-surface-container-low rounded-xl p-1 gap-1 mb-2">
                {taxPresets.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => { setConfig((c) => ({ ...c, taxRate: rate })); setTaxCustom(false); }}
                    className={`flex-1 py-2 text-center rounded-lg text-[13px] font-semibold transition-all ${
                      config.taxRate === rate && !taxCustom
                        ? "bg-surface-container-lowest text-primary shadow-card"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {rate === 0 ? "Tidak" : `${rate}%`}
                  </button>
                ))}
                <button
                  onClick={() => setTaxCustom(true)}
                  className={`flex-1 py-2 text-center rounded-lg text-[13px] font-semibold transition-all ${
                    taxCustom ? "bg-surface-container-lowest text-primary shadow-card" : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Custom
                </button>
              </div>
              {taxCustom && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.taxRate}
                    onChange={(e) => setConfig((c) => ({ ...c, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 h-11 rounded-xl bg-surface-container-low border-none px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan persen..."
                  />
                  <span className="text-[16px] font-semibold text-on-surface-variant">%</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Service charge section */}
        <section className="bg-surface-container-lowest rounded-[20px] p-4 shadow-ambient">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[16px] text-on-surface">Service Charge</h3>
              <p className="text-[12px] text-on-surface-variant">Biaya layanan restoran</p>
            </div>
            <button
              onClick={() => setConfig((c) => ({ ...c, serviceEnabled: !c.serviceEnabled }))}
              className={`toggle-track ${config.serviceEnabled ? "active" : ""}`}
              role="switch"
              aria-checked={config.serviceEnabled}
              id="service-toggle"
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          {config.serviceEnabled && (
            <div>
              <div className="flex bg-surface-container-low rounded-xl p-1 gap-1 mb-2">
                {servicePresets.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => { setConfig((c) => ({ ...c, serviceRate: rate })); setServiceCustom(false); }}
                    className={`flex-1 py-2 text-center rounded-lg text-[13px] font-semibold transition-all ${
                      config.serviceRate === rate && !serviceCustom
                        ? "bg-surface-container-lowest text-primary shadow-card"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {rate === 0 ? "Tidak" : `${rate}%`}
                  </button>
                ))}
                <button
                  onClick={() => setServiceCustom(true)}
                  className={`flex-1 py-2 text-center rounded-lg text-[13px] font-semibold transition-all ${
                    serviceCustom ? "bg-surface-container-lowest text-primary shadow-card" : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Custom
                </button>
              </div>
              {serviceCustom && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.serviceRate}
                    onChange={(e) => setConfig((c) => ({ ...c, serviceRate: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 h-11 rounded-xl bg-surface-container-low border-none px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan persen..."
                  />
                  <span className="text-[16px] font-semibold text-on-surface-variant">%</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Live preview */}
        <section className="bg-primary rounded-[20px] p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-lg" />

          <h3 className="text-[12px] font-bold text-on-primary/70 uppercase tracking-wider mb-3">Preview</h3>
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-[14px] text-on-primary/80">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {config.taxEnabled && config.taxRate > 0 && (
              <div className="flex justify-between text-[14px] text-on-primary/80">
                <span>Pajak ({config.taxRate}%)</span>
                <span>{formatIDR(Math.round(tax))}</span>
              </div>
            )}
            {config.serviceEnabled && config.serviceRate > 0 && (
              <div className="flex justify-between text-[14px] text-on-primary/80">
                <span>Service ({config.serviceRate}%)</span>
                <span>{formatIDR(Math.round(service))}</span>
              </div>
            )}
            <div className="h-px bg-white/20 my-1" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[14px] text-on-primary">Total</span>
              <span className="font-manrope font-bold text-[26px] text-on-primary">{formatIDR(Math.round(total))}</span>
            </div>
          </div>
        </section>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-[14px] shadow-fab hover:bg-surface-tint active:scale-95 transition-all"
          id="calculate-btn"
        >
          Hitung Tagihan
        </button>
      </main>
    </div>
  );
}

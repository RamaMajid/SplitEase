"use client";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/ui/BottomNav";

interface SettingRow {
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  rightEl?: React.ReactNode;
}

function SettingsSection({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <section className="space-y-1">
      <h2 className="text-[12px] font-bold text-primary uppercase tracking-wider px-2 mb-2">{title}</h2>
      <div className="bg-surface-container-lowest rounded-[20px] shadow-ambient overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 ${i < rows.length - 1 ? "border-b border-surface-container-highest" : ""} ${row.onClick ? "hover:bg-surface-container-low cursor-pointer active:scale-[0.99] transition-all" : ""}`}
            onClick={row.onClick}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>{row.icon}</span>
              </div>
              <div>
                <p className="font-medium text-[15px] text-on-surface">{row.title}</p>
                {row.subtitle && <p className="text-[13px] text-on-surface-variant">{row.subtitle}</p>}
              </div>
            </div>
            {row.rightEl ?? (
              row.onClick && <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SettingsScreen() {
  const { state, dispatch } = useApp();

  const taxLabel = state.taxService.taxEnabled ? `${state.taxService.taxRate}%` : "Nonaktif";
  const serviceLabel = state.taxService.serviceEnabled ? `${state.taxService.serviceRate}%` : "Nonaktif";

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(249,249,255,0.88)" }}>
        <div className="w-10" />
        <h1 className="font-manrope font-bold text-[20px] text-primary">Pengaturan</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-4 pt-4 pb-32 space-y-5">
        <SettingsSection
          title="Default"
          rows={[
            {
              icon: "receipt_long",
              title: "Pajak Default",
              subtitle: taxLabel,
              onClick: () => dispatch({ type: "NAVIGATE", screen: "tax-service" }),
            },
            {
              icon: "room_service",
              title: "Service Charge Default",
              subtitle: serviceLabel,
              onClick: () => dispatch({ type: "NAVIGATE", screen: "tax-service" }),
            },
          ]}
        />

        <SettingsSection
          title="Preferensi"
          rows={[
            {
              icon: "payments",
              title: "Mata Uang",
              subtitle: "IDR (Rupiah)",
            },
            {
              icon: "language",
              title: "Bahasa",
              subtitle: "Bahasa Indonesia",
            },
          ]}
        />

        <SettingsSection
          title="Data"
          rows={[
            {
              icon: "history",
              title: "Riwayat Split",
              subtitle: `${state.history.length} sesi tersimpan`,
              onClick: () => dispatch({ type: "NAVIGATE", screen: "history" }),
            },
            {
              icon: "delete_sweep",
              title: "Hapus Semua Riwayat",
              subtitle: "Tindakan ini tidak bisa dibatalkan",
              onClick: () => {
                if (confirm("Hapus semua riwayat? Tindakan ini tidak bisa dibatalkan.")) {
                  state.history.forEach((h) => dispatch({ type: "DELETE_HISTORY", id: h.id }));
                }
              },
            },
          ]}
        />

        <SettingsSection
          title="Tentang"
          rows={[
            {
              icon: "info",
              title: "Tentang SplitEase",
              subtitle: "Versi 1.0.1",
            },
            {
              icon: "star",
              title: "Beri Rating",
              subtitle: "Bantu kami berkembang",
            },
          ]}
        />

        {/* Branding */}
        <div className="flex flex-col items-center gap-3 py-6">
          <Image src="/logo.png" alt="SplitEase" width={64} height={64} className="rounded-full shadow-ambient opacity-80" />
          <div className="text-center">
            <p className="font-manrope font-bold text-[16px] text-primary">SplitEase</p>
            <p className="text-[12px] text-on-surface-variant">Smart Receipt Splitter</p>
            <p className="text-[11px] text-on-surface-variant/60 mt-1">v1.0.1 • Dibuat dengan kondisi lapar</p>
          </div>
        </div>
      </main>

      <BottomNav activeScreen="settings" />
    </div>
  );
}

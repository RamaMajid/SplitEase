"use client";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import StepProgress from "@/components/ui/StepProgress";
import { Participant, PARTICIPANT_COLORS } from "@/lib/store";
import { useState } from "react";

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const steps = ["Scan", "Edit", "Peserta", "Assign", "Pajak", "Hasil"];

export default function ParticipantsScreen() {
  const { state, dispatch } = useApp();
  const [participants, setParticipants] = useState<Participant[]>(
    state.participants.length > 0
      ? state.participants
      : [{ id: "me", name: "Kamu", color: PARTICIPANT_COLORS[0] }]
  );
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const addParticipant = (name: string = newName.trim()) => {
    if (!name) return;
    const id = generateId();
    const color = PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length];
    setParticipants((prev) => [...prev, { id, name, color }]);
    setNewName("");
  };

  const removeParticipant = (id: string) => {
    if (id === "me") return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const renameParticipant = (id: string, name: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleNext = () => {
    const valid = participants.filter((p) => p.name.trim());
    dispatch({ type: "SET_PARTICIPANTS", participants: valid });
    dispatch({ type: "NAVIGATE", screen: "item-assignment" });
  };

  const quickAdd = ["Bude", "Syesye", "Ahmad BF", "Mace", "154", "Ole"];

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Siapa yang Ikut?" backScreen="receipt-editor" />
      <StepProgress steps={steps} currentStep={2} />

      <main className="flex-1 px-4 py-4 pb-36">
        <p className="text-[14px] text-on-surface-variant text-center mb-5">
          Tambahkan semua orang yang ikut dalam tagihan ini.
        </p>

        {/* Participant grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {participants.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-low rounded-[20px] p-3 flex flex-col items-center gap-2 relative border border-transparent focus-within:border-primary transition-colors"
            >
              {p.id !== "me" && (
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-error-container hover:text-error transition-colors"
                  aria-label={`Hapus ${p.name}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
              )}
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[20px] font-bold shadow-ambient"
                style={{ backgroundColor: p.color }}
              >
                {getInitials(p.name || "?")}
              </div>
              {editingId === p.id ? (
                <input
                  autoFocus
                  type="text"
                  value={p.name}
                  onChange={(e) => renameParticipant(p.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                  className="w-full text-center text-[13px] font-semibold text-on-surface bg-transparent border-b-2 border-primary focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingId(p.id)}
                  className="w-full text-center text-[13px] font-semibold text-on-surface truncate hover:text-primary"
                >
                  {p.name || "Nama..."}
                </button>
              )}
            </div>
          ))}

          {/* Add person card */}
          <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[20px] p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              placeholder="Nama..."
              className="w-full text-center text-[13px] bg-transparent border-b border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              id="new-participant-input"
            />
            <button
              onClick={() => addParticipant()}
              className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
              aria-label="Tambah peserta"
              id="add-participant-btn"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {/* Quick add */}
        <div>
          <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">Tambah Cepat</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {quickAdd
              .filter((name) => !participants.some((p) => p.name === name))
              .map((name) => (
                <button
                  key={name}
                  onClick={() => addParticipant(name)}
                  className="flex-shrink-0 flex items-center gap-1 bg-secondary-container/30 text-primary px-3 py-2 rounded-full border border-transparent hover:border-secondary/30 transition-colors text-[13px] font-semibold"
                >
                  <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">
                    {name[0]}
                  </span>
                  {name}
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                </button>
              ))}
          </div>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] p-4 pb-6"
        style={{ background: "linear-gradient(to top, #f9f9ff, #f9f9ff 70%, transparent)" }}>
        <button
          onClick={handleNext}
          disabled={participants.length === 0}
          className="w-full bg-primary text-on-primary py-4 rounded-full font-semibold text-[14px] shadow-fab hover:bg-surface-tint active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          id="next-assign-items-btn"
        >
          Lanjut: Assign Item
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

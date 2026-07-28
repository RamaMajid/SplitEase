"use client";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/ui/TopBar";
import StepProgress from "@/components/ui/StepProgress";
import {
  formatIDR, AssignmentGroup, ReceiptItem,
  getAssignedIds, getTotalAssignedQty,
} from "@/lib/store";
import { useState } from "react";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const steps = ["Scan", "Edit", "Peserta", "Assign", "Pajak", "Hasil"];

export default function ItemAssignmentScreen() {
  const { state, dispatch } = useApp();
  // Track which item+group is in "merge picker" mode (choosing whom to merge with)
  const [mergePicker, setMergePicker] = useState<{ itemId: string; participantId: string } | null>(null);

  const grandTotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalAssigned = state.items.reduce((sum, item) => {
    return sum + item.assignmentGroups.reduce((s, g) => s + item.price * g.qty, 0);
  }, 0);
  const allAssigned = state.items.length > 0 && state.items.every((i) => i.assignmentGroups.length > 0);
  const unassignedCount = state.items.filter((i) => i.assignmentGroups.length === 0).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff]">
      <TopBar title="Assign Item" />
      <StepProgress steps={steps} currentStep={3} />

      {/* Legend */}
      <div className="sticky z-30 bg-[#f9f9ff]/95 backdrop-blur-md px-4 py-3 border-b border-surface-container-low"
        style={{ top: "calc(4rem + 60px)" }}>
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
          Tap avatar untuk assign — drag ke grup yang sama untuk berbagi
        </p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {state.participants.map((p) => (
            <div key={p.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: p.color }}>{getInitials(p.name)}</div>
              <span className="text-[13px] font-semibold" style={{ color: p.color }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 pt-4 pb-32 flex flex-col gap-3">
        {state.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            participants={state.participants}
            mergePicker={mergePicker}
            setMergePicker={setMergePicker}
            dispatch={dispatch}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-50 bg-[#f9f9ff]/90 backdrop-blur-md border-t border-surface-container-low px-4 py-3 pb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-on-surface-variant">Total Assigned</p>
          <p className="font-manrope font-bold text-[18px] text-on-surface">
            {formatIDR(Math.round(totalAssigned))}
            <span className="text-[13px] font-normal text-on-surface-variant"> / {formatIDR(grandTotal)}</span>
          </p>
          {!allAssigned && <p className="text-[11px] text-error">{unassignedCount} item belum di-assign</p>}
        </div>
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "tax-service" })}
          disabled={!allAssigned}
          className="bg-primary text-on-primary px-5 py-3 rounded-full font-semibold text-[13px] shadow-fab flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          id="next-tax-btn"
        >
          Pajak & Service
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({
  item, participants, mergePicker, setMergePicker, dispatch,
}: {
  item: ReceiptItem;
  participants: { id: string; name: string; color: string }[];
  mergePicker: { itemId: string; participantId: string } | null;
  setMergePicker: (v: { itemId: string; participantId: string } | null) => void;
  dispatch: React.Dispatch<import("@/lib/store").Action>;
}) {
  const assignedIds = getAssignedIds(item);
  const unassignedParticipants = participants.filter((p) => !assignedIds.includes(p.id));
  const unitPrice = item.price; // price is already unit price
  const totalAssignedQty = getTotalAssignedQty(item);
  const qtyMismatch = item.assignmentGroups.length > 0 && totalAssignedQty !== item.qty;
  const isAssigned = item.assignmentGroups.length > 0;

  return (
    <div className={`rounded-[20px] p-4 shadow-ambient transition-all ${
      isAssigned && !qtyMismatch ? "bg-[#F2FBF4]"
      : !isAssigned ? "bg-surface-container-lowest border-2 border-error/20"
      : "bg-amber-50 border-2 border-amber-200"
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-semibold text-on-surface-variant">
              {item.qty}×
            </span>
            <h3 className="font-semibold text-[15px] text-on-surface truncate">{item.name}</h3>
          </div>
          {!isAssigned ? (
            <p className="text-[12px] text-error flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
              Belum di-assign
            </p>
          ) : qtyMismatch ? (
            <p className="text-[12px] text-amber-600">
              Total porsi: {totalAssignedQty}/{item.qty} — sesuaikan qty
            </p>
          ) : (
            <p className="text-[12px] text-on-surface-variant">
              {item.assignmentGroups.length === 1 && item.assignmentGroups[0].participantIds.length === 1
                ? `Milik ${participants.find(p => p.id === item.assignmentGroups[0].participantIds[0])?.name}`
                : `${item.assignmentGroups.length} grup · ${formatIDR(unitPrice)}/porsi`}
            </p>
          )}
        </div>
        <span className="font-bold text-[15px] text-on-surface whitespace-nowrap ml-2">{formatIDR(item.price * item.qty)}</span>
      </div>

      {/* ── Assigned Groups ── */}
      {item.assignmentGroups.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {item.assignmentGroups.map((group) => (
            <GroupCard
              key={group.id}
              item={item}
              group={group}
              participants={participants}
              unitPrice={unitPrice}
              showQtyStepper={item.qty > 1}
              otherGroups={item.assignmentGroups.filter(g => g.id !== group.id)}
              mergePicker={mergePicker}
              setMergePicker={setMergePicker}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}

      {/* ── Unassigned participants — tap to add as solo ── */}
      {unassignedParticipants.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
            {isAssigned ? "Tambah ke item ini:" : "Assign ke:"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {unassignedParticipants.map((p) => {
              // If merge picker is active for this item, tapping adds to that group
              const isMergeMode = mergePicker?.itemId === item.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (isMergeMode) {
                      // Find the group that the picker participant belongs to
                      const srcGroup = item.assignmentGroups.find(g =>
                        g.participantIds.includes(mergePicker.participantId)
                      );
                      if (srcGroup) {
                        dispatch({ type: "MERGE_INTO_GROUP", itemId: item.id, targetGroupId: srcGroup.id, participantId: p.id });
                      }
                      setMergePicker(null);
                    } else {
                      dispatch({ type: "ASSIGN_SOLO", itemId: item.id, participantId: p.id });
                    }
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold transition-all active:scale-90 ${
                    isMergeMode
                      ? "ring-2 ring-offset-2 animate-pulse"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                  style={isMergeMode ? { outline: "2px solid var(--color-primary)", outlineOffset: "2px" } : {}}
                  aria-label={`Assign ${p.name}`}
                >
                  {getInitials(p.name)}
                </button>
              );
            })}
          </div>
          {mergePicker?.itemId === item.id && (
            <p className="text-[12px] text-primary mt-1.5 font-medium">
              ← Pilih siapa yang ikut gabung ke grup ini
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({
  item, group, participants, unitPrice, showQtyStepper, otherGroups,
  mergePicker, setMergePicker, dispatch,
}: {
  item: ReceiptItem;
  group: AssignmentGroup;
  participants: { id: string; name: string; color: string }[];
  unitPrice: number;
  showQtyStepper: boolean;
  otherGroups: AssignmentGroup[];
  mergePicker: { itemId: string; participantId: string } | null;
  setMergePicker: (v: { itemId: string; participantId: string } | null) => void;
  dispatch: React.Dispatch<import("@/lib/store").Action>;
}) {
  const groupAmount = unitPrice * group.qty;
  const perPersonAmount = groupAmount / group.participantIds.length;
  const isShared = group.participantIds.length > 1;
  const isMergeActive = mergePicker?.itemId === item.id;

  return (
    <div className={`rounded-[16px] px-3 py-2.5 transition-all ${
      isShared ? "bg-secondary-container/30 border border-secondary/20" : "bg-surface-container-low"
    }`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Avatars */}
        <div className="flex items-center">
          {group.participantIds.map((pid, idx) => {
            const p = participants.find((pp) => pp.id === pid);
            if (!p) return null;
            return (
              <div key={pid} className="relative" style={{ marginLeft: idx > 0 ? -8 : 0 }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold text-white border-2 border-white shadow-sm"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                >
                  {getInitials(p.name)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Name(s) + amount */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-on-surface truncate">
            {group.participantIds.map(pid => participants.find(p => p.id === pid)?.name).join(" + ")}
          </p>
          <p className="text-[11px] text-on-surface-variant">
            {isShared
              ? `Bagi bersama · ${formatIDR(Math.round(perPersonAmount))} / orang`
              : `Sendiri · ${formatIDR(Math.round(perPersonAmount))}`}
          </p>
        </div>

        {/* Qty stepper (if item has qty > 1) */}
        {showQtyStepper && (
          <div className="flex items-center gap-1 bg-surface-container-lowest rounded-full px-2 py-1 shadow-card">
            <button
              onClick={() => dispatch({ type: "SET_GROUP_QTY", itemId: item.id, groupId: group.id, qty: group.qty - 1 })}
              className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              disabled={group.qty <= 1}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
            </button>
            <span className="text-[14px] font-bold text-on-surface min-w-[18px] text-center">{group.qty}</span>
            <button
              onClick={() => dispatch({ type: "SET_GROUP_QTY", itemId: item.id, groupId: group.id, qty: group.qty + 1 })}
              className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {/* Gabungkan — invite someone else into this group */}
        {!isMergeActive && (
          <button
            onClick={() => {
              setMergePicker(
                mergePicker?.itemId === item.id && mergePicker.participantId === group.participantIds[0]
                  ? null
                  : { itemId: item.id, participantId: group.participantIds[0] }
              );
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>group_add</span>
            Gabungkan
          </button>
        )}
        {isMergeActive && mergePicker?.participantId === group.participantIds[0] && (
          <button
            onClick={() => setMergePicker(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-error bg-error/10 px-3 py-1 rounded-full"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
            Batal gabung
          </button>
        )}

        {/* Pisahkan — only shown for multi-person groups (per member) */}
        {isShared && group.participantIds.map((pid) => {
          const p = participants.find((pp) => pp.id === pid);
          return (
            <button
              key={pid}
              onClick={() => dispatch({ type: "SPLIT_FROM_GROUP", itemId: item.id, participantId: pid })}
              className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full hover:bg-error-container hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person_remove</span>
              Pisahkan {p?.name}
            </button>
          );
        })}

        {/* Hapus (solo group) */}
        {!isShared && (
          <button
            onClick={() => dispatch({ type: "UNASSIGN", itemId: item.id, participantId: group.participantIds[0] })}
            className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full hover:bg-error-container hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
            Hapus
          </button>
        )}

        {/* Merge with another existing group */}
        {otherGroups.length > 0 && !isShared && (
          <div className="flex items-center gap-1 flex-wrap">
            {otherGroups.filter(og => og.participantIds.length > 0).map((og) => {
              const ogNames = og.participantIds.map(pid => participants.find(p => p.id === pid)?.name).join(", ");
              return (
                <button
                  key={og.id}
                  onClick={() =>
                    dispatch({
                      type: "MERGE_INTO_GROUP",
                      itemId: item.id,
                      targetGroupId: og.id,
                      participantId: group.participantIds[0],
                    })
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-secondary bg-secondary-container/40 px-3 py-1 rounded-full hover:bg-secondary-container transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>merge</span>
                  Gabung ke grup {ogNames}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

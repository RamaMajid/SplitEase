// ─── Assignment Group ─────────────────────────────────────────────────────────
/**
 * Satu "grup" dalam sebuah item.
 * - 1 orang  → bayar sendiri (solo)
 * - 2+ orang → bagi rata qty yang mereka pesan bersama
 */
export interface AssignmentGroup {
  id: string;
  participantIds: string[]; // anggota grup
  qty: number;              // jumlah porsi yang di-share oleh grup ini
}

// ─── Receipt Item ─────────────────────────────────────────────────────────────
export interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: number; // harga satuan per porsi (unit price)
  assignmentGroups: AssignmentGroup[];
}

/** Helper: total price of an item = unit price × qty */
export function getItemTotal(item: ReceiptItem): number {
  return item.price * item.qty;
}

// Helpers
export function getAssignedIds(item: ReceiptItem): string[] {
  return item.assignmentGroups.flatMap((g) => g.participantIds);
}
export function getParticipantGroup(item: ReceiptItem, pid: string): AssignmentGroup | undefined {
  return item.assignmentGroups.find((g) => g.participantIds.includes(pid));
}
export function getTotalAssignedQty(item: ReceiptItem): number {
  return item.assignmentGroups.reduce((s, g) => s + g.qty, 0);
}

// ─── Participant ──────────────────────────────────────────────────────────────
export interface Participant {
  id: string;
  name: string;
  color: string;
}

// ─── Tax / Service ────────────────────────────────────────────────────────────
export interface TaxServiceConfig {
  taxEnabled: boolean;
  taxRate: number;
  serviceEnabled: boolean;
  serviceRate: number;
}

// ─── Calculation Result ───────────────────────────────────────────────────────
export interface CalculationResultItem {
  name: string;
  amount: number;
  shared: boolean;
  splitWith: number;
  qty: number;
}
export interface CalculationResult {
  participantId: string;
  participantName: string;
  items: CalculationResultItem[];
  subtotal: number;
  tax: number;
  service: number;
  total: number;
}

// ─── History ──────────────────────────────────────────────────────────────────
export interface HistoryEntry {
  id: string;
  restaurantName: string;
  date: string;
  participants: string[];
  grandTotal: number;
  items: ReceiptItem[];
  taxService: TaxServiceConfig;
  results: CalculationResult[];
}

// ─── App State ────────────────────────────────────────────────────────────────
export interface AppState {
  currentScreen: Screen;
  restaurantName: string;
  receiptDate: string;
  items: ReceiptItem[];
  participants: Participant[];
  taxService: TaxServiceConfig;
  results: CalculationResult[];
  history: HistoryEntry[];
  uploadedImage: string | null;
  fromHistory: boolean; // true when viewing a saved history entry
}

export type Screen =
  | "home"
  | "scanner"
  | "processing"
  | "receipt-preview"
  | "receipt-editor"
  | "participants"
  | "item-assignment"
  | "tax-service"
  | "summary"
  | "history"
  | "settings";

export const PARTICIPANT_COLORS = [
  "#01796f", "#306a34", "#4d5651", "#005e56",
  "#15521f", "#404944", "#006a61", "#36713a",
];

// ─── Initial State ────────────────────────────────────────────────────────────
export const initialState: AppState = {
  currentScreen: "home",
  restaurantName: "",
  receiptDate: "",
  items: [],
  participants: [],
  taxService: { taxEnabled: true, taxRate: 10, serviceEnabled: false, serviceRate: 5 },
  results: [],
  history: [],
  uploadedImage: null,
  fromHistory: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
function genId() { return Math.random().toString(36).slice(2, 9); }

export type Action =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "SET_RESTAURANT"; name: string; date: string }
  | { type: "SET_ITEMS"; items: ReceiptItem[] }
  | { type: "ADD_ITEM"; item: ReceiptItem }
  | { type: "UPDATE_ITEM"; item: ReceiptItem }
  | { type: "DELETE_ITEM"; id: string }
  | { type: "SET_PARTICIPANTS"; participants: Participant[] }
  | { type: "ADD_PARTICIPANT"; participant: Participant }
  | { type: "REMOVE_PARTICIPANT"; id: string }
  | { type: "RENAME_PARTICIPANT"; id: string; name: string }
  // Group-based assignment
  | { type: "ASSIGN_SOLO"; itemId: string; participantId: string }         // add as new solo group
  | { type: "UNASSIGN"; itemId: string; participantId: string }            // remove from groups
  | { type: "MERGE_INTO_GROUP"; itemId: string; targetGroupId: string; participantId: string } // join existing group
  | { type: "SPLIT_FROM_GROUP"; itemId: string; participantId: string }   // leave group → solo
  | { type: "SET_GROUP_QTY"; itemId: string; groupId: string; qty: number }
  // Misc
  | { type: "SET_TAX_SERVICE"; config: TaxServiceConfig }
  | { type: "SET_RESULTS"; results: CalculationResult[] }
  | { type: "SAVE_TO_HISTORY" }
  | { type: "DELETE_HISTORY"; id: string }
  | { type: "LOAD_FROM_HISTORY"; entry: HistoryEntry }
  | { type: "LOAD_HISTORY"; history: HistoryEntry[] }
  | { type: "SET_IMAGE"; image: string | null }
  | { type: "RESET_SESSION" };

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "NAVIGATE": return { ...state, currentScreen: action.screen };
    case "SET_RESTAURANT": return { ...state, restaurantName: action.name, receiptDate: action.date };
    case "SET_ITEMS": return { ...state, items: action.items };
    case "ADD_ITEM": return { ...state, items: [...state.items, action.item] };
    case "UPDATE_ITEM":
      return { ...state, items: state.items.map((i) => i.id === action.item.id ? action.item : i) };
    case "DELETE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "SET_PARTICIPANTS": return { ...state, participants: action.participants };
    case "ADD_PARTICIPANT":
      return { ...state, participants: [...state.participants, action.participant] };

    case "REMOVE_PARTICIPANT": {
      const newParticipants = state.participants.filter((p) => p.id !== action.id);
      const newItems = state.items.map((item) => ({
        ...item,
        assignmentGroups: item.assignmentGroups
          .map((g) => ({ ...g, participantIds: g.participantIds.filter((pid) => pid !== action.id) }))
          .filter((g) => g.participantIds.length > 0),
      }));
      return { ...state, participants: newParticipants, items: newItems };
    }

    case "RENAME_PARTICIPANT":
      return { ...state, participants: state.participants.map((p) => p.id === action.id ? { ...p, name: action.name } : p) };

    case "ASSIGN_SOLO": {
      const item = state.items.find((i) => i.id === action.itemId);
      if (!item || getAssignedIds(item).includes(action.participantId)) return state;
      const newGroup: AssignmentGroup = { id: genId(), participantIds: [action.participantId], qty: 1 };
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, assignmentGroups: [...i.assignmentGroups, newGroup] } : i
        ),
      };
    }

    case "UNASSIGN": {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.itemId) return item;
          return {
            ...item,
            assignmentGroups: item.assignmentGroups
              .map((g) => ({ ...g, participantIds: g.participantIds.filter((pid) => pid !== action.participantId) }))
              .filter((g) => g.participantIds.length > 0),
          };
        }),
      };
    }

    case "MERGE_INTO_GROUP": {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.itemId) return item;
          // Remove from any current group first, then add to target
          const cleaned = item.assignmentGroups
            .map((g) => ({ ...g, participantIds: g.participantIds.filter((pid) => pid !== action.participantId) }))
            .filter((g) => g.participantIds.length > 0);
          return {
            ...item,
            assignmentGroups: cleaned.map((g) =>
              g.id === action.targetGroupId
                ? { ...g, participantIds: [...g.participantIds, action.participantId] }
                : g
            ),
          };
        }),
      };
    }

    case "SPLIT_FROM_GROUP": {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.itemId) return item;
          const newGroup: AssignmentGroup = { id: genId(), participantIds: [action.participantId], qty: 1 };
          return {
            ...item,
            assignmentGroups: [
              ...item.assignmentGroups
                .map((g) => ({ ...g, participantIds: g.participantIds.filter((pid) => pid !== action.participantId) }))
                .filter((g) => g.participantIds.length > 0),
              newGroup,
            ],
          };
        }),
      };
    }

    case "SET_GROUP_QTY": {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.itemId) return item;
          return {
            ...item,
            assignmentGroups: item.assignmentGroups.map((g) =>
              g.id === action.groupId ? { ...g, qty: Math.max(1, action.qty) } : g
            ),
          };
        }),
      };
    }

    case "SET_TAX_SERVICE": return { ...state, taxService: action.config };
    case "SET_RESULTS": return { ...state, results: action.results };

    case "SAVE_TO_HISTORY": {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        restaurantName: state.restaurantName || "Unknown Restaurant",
        date: state.receiptDate || new Date().toLocaleDateString("id-ID"),
        participants: state.participants.map((p) => p.name),
        grandTotal: state.results.reduce((sum, r) => sum + r.total, 0),
        items: state.items,
        taxService: state.taxService,
        results: state.results,
      };
      const newHistory = [entry, ...state.history];
      if (typeof window !== "undefined") localStorage.setItem("splitease_history", JSON.stringify(newHistory));
      return { ...state, history: newHistory };
    }

    case "DELETE_HISTORY": {
      const newHistory = state.history.filter((h) => h.id !== action.id);
      if (typeof window !== "undefined") localStorage.setItem("splitease_history", JSON.stringify(newHistory));
      return { ...state, history: newHistory };
    }

    case "LOAD_FROM_HISTORY":
      return { ...state, restaurantName: action.entry.restaurantName, receiptDate: action.entry.date, items: action.entry.items, taxService: action.entry.taxService, results: action.entry.results, currentScreen: "summary", fromHistory: true };

    case "LOAD_HISTORY": return { ...state, history: action.history };
    case "SET_IMAGE": return { ...state, uploadedImage: action.image };

    case "RESET_SESSION":
      return { ...state, restaurantName: "", receiptDate: "", items: [], participants: [], results: [], uploadedImage: null, taxService: { taxEnabled: true, taxRate: 10, serviceEnabled: false, serviceRate: 5 }, currentScreen: "home", fromHistory: false };

    default: return state;
  }
}

// ─── Calculation Engine ───────────────────────────────────────────────────────
export function calculateSplit(
  items: ReceiptItem[],
  participants: Participant[],
  taxService: TaxServiceConfig
): CalculationResult[] {
  if (participants.length === 0) return [];

  const results: CalculationResult[] = participants.map((p) => ({
    participantId: p.id, participantName: p.name, items: [], subtotal: 0, tax: 0, service: 0, total: 0,
  }));

  for (const item of items) {
    if (item.assignmentGroups.length === 0) continue;
    // item.price = harga satuan per porsi
    const unitPrice = item.price;

    for (const group of item.assignmentGroups) {
      // total biaya porsi yang dikonsumsi grup ini
      const groupAmount = unitPrice * group.qty;
      // dibagi rata ke semua anggota grup
      const perPersonAmount = groupAmount / group.participantIds.length;

      for (const pid of group.participantIds) {
        const result = results.find((r) => r.participantId === pid);
        if (!result) continue;

        const isShared = group.participantIds.length > 1;
        const nameSuffix = group.qty > 1
          ? ` (${group.qty}×${isShared ? `, bagi ${group.participantIds.length}` : ""})`
          : isShared ? ` (bagi ${group.participantIds.length})` : "";

        result.items.push({
          name: item.name + nameSuffix,
          amount: Math.round(perPersonAmount),
          shared: isShared,
          splitWith: group.participantIds.length,
          qty: group.qty,
        });
        result.subtotal += perPersonAmount;
      }
    }
  }

  for (const result of results) {
    result.tax = taxService.taxEnabled ? result.subtotal * (taxService.taxRate / 100) : 0;
    result.service = taxService.serviceEnabled ? result.subtotal * (taxService.serviceRate / 100) : 0;
    result.subtotal = Math.round(result.subtotal);
    result.tax = Math.round(result.tax);
    result.service = Math.round(result.service);
    result.total = result.subtotal + result.tax + result.service;
  }

  return results;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
export const sampleReceiptData = {
  restaurantName: "Warung Makan Sederhana",
  date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
  items: [
    { id: "1", name: "Nasi Goreng Spesial", qty: 2, price: 25000, assignmentGroups: [] },
    { id: "2", name: "Ayam Bakar Madu", qty: 1, price: 45000, assignmentGroups: [] },
    { id: "3", name: "Es Teh Manis", qty: 3, price: 5000, assignmentGroups: [] },
    { id: "4", name: "Soto Ayam", qty: 1, price: 30000, assignmentGroups: [] },
    { id: "5", name: "Kerupuk", qty: 2, price: 4000, assignmentGroups: [] },
  ] as ReceiptItem[],
};

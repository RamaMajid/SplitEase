"use client";
import { useApp } from "@/context/AppContext";
import HomeScreen from "@/components/screens/HomeScreen";
import ScannerScreen from "@/components/screens/ScannerScreen";
import ProcessingScreen from "@/components/screens/ProcessingScreen";
import ReceiptPreviewScreen from "@/components/screens/ReceiptPreviewScreen";
import ReceiptEditorScreen from "@/components/screens/ReceiptEditorScreen";
import ParticipantsScreen from "@/components/screens/ParticipantsScreen";
import ItemAssignmentScreen from "@/components/screens/ItemAssignmentScreen";
import TaxServiceScreen from "@/components/screens/TaxServiceScreen";
import SummaryScreen from "@/components/screens/SummaryScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

export default function Page() {
  const { state } = useApp();

  const screens: Record<string, React.ReactNode> = {
    home: <HomeScreen />,
    scanner: <ScannerScreen />,
    processing: <ProcessingScreen />,
    "receipt-preview": <ReceiptPreviewScreen />,
    "receipt-editor": <ReceiptEditorScreen />,
    participants: <ParticipantsScreen />,
    "item-assignment": <ItemAssignmentScreen />,
    "tax-service": <TaxServiceScreen />,
    summary: <SummaryScreen />,
    history: <HistoryScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="w-full max-w-[600px] min-h-screen bg-[#f9f9ff] shadow-2xl relative overflow-hidden">
      {screens[state.currentScreen] ?? <HomeScreen />}
    </div>
  );
}

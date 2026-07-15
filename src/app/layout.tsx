import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "SplitEase — Smart Receipt Splitter",
  description:
    "Split restaurant bills fairly and accurately. Scan receipts, assign items to friends, and calculate everyone's share in seconds.",
  keywords: ["split bill", "receipt splitter", "bill splitting", "restaurant", "splitease"],
  authors: [{ name: "SplitEase" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SplitEase — Smart Receipt Splitter",
    description: "Split restaurant bills fairly and accurately.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#005e56",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <div className="flex justify-center bg-surface-container-low min-h-screen">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

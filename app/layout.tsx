import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "GreenBalance",
  description: "Nutrizione clinica e mindfulness per una vita in equilibrio",
  applicationName: "GreenBalance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GreenBalance",
  },
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#B2AC88",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AppProviders>
          <main className="gb-main animate-fade-in">
            {children}
          </main>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}

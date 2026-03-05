import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Whisper - Confidential Prediction Markets",
  description: "Bet on real-world events with full privacy. Powered by COTI confidential tokens.",
  openGraph: {
    title: "Whisper - Confidential Prediction Markets",
    description: "Bet on real-world events with full privacy. Powered by COTI.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#050505] text-white`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}

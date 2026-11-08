import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { AnalyticsProvider } from "@/components/shell/providers";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display-serif", display: "swap", axes: ["SOFT", "opsz"] });
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Dreamscape — author your year", template: "%s · Dreamscape" },
  description: "A gentle 12-month journey of reflection, intention, and meditative coloring. Your life is a story you can author yourself.",
  applicationName: "Dreamscape",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1917" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}

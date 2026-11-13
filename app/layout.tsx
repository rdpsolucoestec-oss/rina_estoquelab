import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  title: "Estoque do Laboratório",
  description: "Controle de estoque do laboratório · Rina Soluções",
  manifest: `${BASE}/manifest.webmanifest`,
  icons: { icon: [{ url: `${BASE}/favicon.ico` }, { url: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" }], apple: `${BASE}/apple-touch-icon.png` },
  appleWebApp: { capable: true, title: "Estoque Lab", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#0a1a33", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR"><body>{children}<PwaRegister /></body></html>);
}

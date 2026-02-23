import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { DdragonInit } from "@/lib/DdragonInit";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UPYLOL — Analise. Melhore. Suba de elo.",
    template: "%s | UPYLOL",
  },
  description:
    "Plataforma de análise individual de performance no League of Legends. " +
    "Diagnóstico de melhorias, melhores campeões, KDA e mais.",
  keywords: [
    "league of legends",
    "lol stats",
    "performance analysis",
    "improve lol",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${rajdhani.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <DdragonInit />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}

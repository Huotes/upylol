import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Campeões",
  description: "Estatísticas e tier list de campeões do League of Legends.",
};

export default function ChampionsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Construction className="h-12 w-12 text-[var(--color-text-muted)]" />
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)]">
        Tier List de Campeões
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
        Esta seção está em desenvolvimento. Em breve você poderá ver estatísticas
        globais, builds recomendadas e os melhores campeões por elo e role.
      </p>
    </div>
  );
}

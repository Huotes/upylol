import { PlayerSearch } from "@/components/search/PlayerSearch";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          <span className="text-accent">UPY</span>LOL
        </h1>
        <p className="mt-3 text-lg text-text-secondary">
          Analise sua performance. Descubra como melhorar. Suba de elo.
        </p>
      </div>

      <PlayerSearch />

      <div className="mt-16 grid max-w-3xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
        {[
          {
            icon: "📊",
            title: "Performance Score",
            desc: "7 dimensões analisadas contra benchmarks do seu elo",
          },
          {
            icon: "🎯",
            title: "Diagnóstico",
            desc: "Identifica seus pontos fracos e prioriza melhorias",
          },
          {
            icon: "🏆",
            title: "Melhores Campeões",
            desc: "Descubra em quais campeões você performa melhor",
          },
        ].map((feature) => (
          <div key={feature.title} className="rounded-xl border border-border bg-bg-card p-5">
            <div className="mb-2 text-2xl">{feature.icon}</div>
            <h3 className="mb-1 text-sm font-semibold">{feature.title}</h3>
            <p className="text-xs text-text-secondary">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

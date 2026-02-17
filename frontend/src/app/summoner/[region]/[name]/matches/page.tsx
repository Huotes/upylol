"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { useSummoner, useMatches } from "@/hooks";
import { parseSummonerName } from "@/lib/utils";
import { MatchHistory } from "@/components/summoner/MatchHistory";
import { Loading } from "@/components/common/Loading";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { SkeletonMatchRow } from "@/components/ui/Skeleton";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

const QUEUE_TABS = [
  { value: "all", label: "Todas" },
  { value: "420", label: "Ranked Solo" },
  { value: "440", label: "Ranked Flex" },
  { value: "450", label: "ARAM" },
  { value: "400", label: "Normal" },
];

export default function MatchesPage({ params }: PageProps) {
  const { region, name } = use(params);
  const { gameName, tagLine } = parseSummonerName(name);
  const [queueFilter, setQueueFilter] = useState("all");

  const { data: summoner, isLoading: summonerLoading } = useSummoner(
    region,
    gameName,
    tagLine,
  );

  const queue = queueFilter !== "all" ? Number(queueFilter) : undefined;
  const {
    data: matches,
    isLoading: matchesLoading,
    error,
    refetch,
  } = useMatches(summoner?.puuid ?? "", region, { count: 50, queue });

  if (summonerLoading) {
    return <Loading text="Carregando..." className="min-h-[60vh]" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back link */}
      <Link
        href={`/summoner/${region}/${name}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)]">
        Histórico de Partidas
      </h1>

      {/* Queue filter */}
      <Tabs
        tabs={QUEUE_TABS}
        activeTab={queueFilter}
        onTabChange={setQueueFilter}
        className="mb-4"
      />

      {/* Content */}
      {matchesLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonMatchRow key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Erro ao carregar partidas."
          onRetry={() => refetch()}
        />
      ) : matches && matches.length > 0 ? (
        <MatchHistory matches={matches} />
      ) : (
        <EmptyState
          title="Sem partidas"
          message="Nenhuma partida encontrada com os filtros selecionados."
        />
      )}
    </div>
  );
}

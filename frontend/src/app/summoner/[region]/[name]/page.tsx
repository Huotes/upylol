"use client";

import { use, useState } from "react";
import { useSummoner, useMatches, useChampions } from "@/hooks";
import { parseSummonerName } from "@/lib/utils";
import { SummonerHeader } from "@/components/summoner/SummonerHeader";
import { MatchHistory } from "@/components/summoner/MatchHistory";
import { ChampionCard } from "@/components/champion/ChampionCard";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/ui/States";
import { SkeletonMatchRow } from "@/components/ui/Skeleton";
import Link from "next/link";
import { BarChart3, Swords, Trophy } from "lucide-react";

interface PageProps {
  params: Promise<{ region: string; name: string }>;
}

export default function SummonerPage({ params }: PageProps) {
  const { region, name } = use(params);
  const { gameName, tagLine } = parseSummonerName(name);

  const [activeTab, setActiveTab] = useState("matches");

  const {
    data: summoner,
    isLoading: summonerLoading,
    error: summonerError,
    refetch: refetchSummoner,
  } = useSummoner(region, gameName, tagLine);

  const {
    data: matches,
    isLoading: matchesLoading,
  } = useMatches(summoner?.puuid ?? "", region, { count: 20 });

  const {
    data: championsData,
    isLoading: championsLoading,
  } = useChampions(summoner?.puuid ?? "", region);

  // Loading state
  if (summonerLoading) {
    return (
      <Loading
        size="lg"
        text={`Buscando ${gameName}#${tagLine}...`}
        className="min-h-[60vh]"
      />
    );
  }

  // Error state
  if (summonerError ?? !summoner) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorState
          title="Invocador não encontrado"
          message={`Não foi possível encontrar "${gameName}#${tagLine}" na região ${region.toUpperCase()}.`}
          onRetry={() => refetchSummoner()}
        />
      </div>
    );
  }

  const tabs = [
    { value: "matches", label: "Partidas", count: matches?.length },
    {
      value: "champions",
      label: "Campeões",
      count: championsData?.champions.length,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Profile header */}
      <SummonerHeader summoner={summoner} />

      {/* Analysis CTA */}
      <div className="mt-4">
        <Link
          href={`/summoner/${region}/${name}/analysis`}
          className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border-accent)] bg-[color-mix(in_srgb,var(--color-cyan-glow)_8%,transparent)] px-5 py-3 text-sm font-bold text-[var(--color-text-accent)] transition-all hover:bg-[color-mix(in_srgb,var(--color-cyan-glow)_15%,transparent)]"
        >
          <BarChart3 className="h-4 w-4" />
          Ver análise completa de performance
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "matches" && (
          <div>
            {matchesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonMatchRow key={i} />
                ))}
              </div>
            ) : matches ? (
              <MatchHistory matches={matches} />
            ) : null}
          </div>
        )}

        {activeTab === "champions" && (
          <div>
            {championsLoading ? (
              <Loading text="Carregando campeões..." />
            ) : championsData ? (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Pool suggestion */}
                {championsData.pool_suggestion.primary_pick && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>
                        <Trophy className="mr-2 inline h-5 w-5 text-[var(--color-gold-accent)]" />
                        Pool Sugerido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                            Pick Principal
                          </span>
                          <ChampionCard
                            champion={championsData.pool_suggestion.primary_pick}
                            compact
                          />
                        </div>
                        {championsData.pool_suggestion.high_winrate_picks.length > 0 && (
                          <div>
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                              Alto Winrate
                            </span>
                            <div className="space-y-1">
                              {championsData.pool_suggestion.high_winrate_picks.map(
                                (c) => (
                                  <ChampionCard
                                    key={c.champion_id}
                                    champion={c}
                                    compact
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* All champions */}
                {championsData.champions.map((champ, i) => (
                  <ChampionCard
                    key={champ.champion_id}
                    champion={champ}
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

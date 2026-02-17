import type { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ region: string; name: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; name: string }>;
}): Promise<Metadata> {
  const { name, region } = await params;
  const decoded = decodeURIComponent(name).replace("-", "#");

  return {
    title: `${decoded} (${region.toUpperCase()})`,
    description: `Perfil e análise de performance de ${decoded} no League of Legends.`,
  };
}

export default function SummonerLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

import type { ReactNode } from "react";

interface PlayerLayoutProps {
  children: ReactNode;
  params: Promise<{ region: string; name: string }>;
}

export default async function PlayerLayout({
  children,
  params,
}: PlayerLayoutProps) {
  const { region, name } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {children}
    </div>
  );
}

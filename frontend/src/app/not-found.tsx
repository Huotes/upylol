import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-6xl">🔍</span>
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-text-secondary">
        A página que você procura não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-bg-primary transition-all hover:brightness-110"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

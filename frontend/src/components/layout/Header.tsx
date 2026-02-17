import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-bg-secondary/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-accent">
            UPY
          </span>
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            LOL
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link href="/" className="transition-colors hover:text-accent">
            Home
          </Link>
          <a
            href="https://developer.riotgames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            Riot API
          </a>
        </nav>
      </div>
    </header>
  );
}

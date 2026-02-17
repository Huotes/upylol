# upylol — Frontend

Frontend Next.js 15 do upylol, plataforma de análise de performance individual para League of Legends.

## Stack

- **Next.js 15** — App Router, React Server Components, Turbopack
- **TypeScript 5** — Strict mode
- **Tailwind CSS 4** — Utility-first, CSS variables, dark theme nativo
- **TanStack Query v5** — Cache inteligente, stale-while-revalidate
- **Recharts** — Radar chart de performance
- **Lucide React** — Ícones
- **Framer Motion** — Animações (opcional, disponível)

## Estrutura

```
src/
├── app/                      # App Router (páginas)
│   ├── layout.tsx            # Root layout + providers + fonts
│   ├── page.tsx              # Home: search hero
│   ├── summoner/[region]/[name]/
│   │   ├── page.tsx          # Perfil do invocador
│   │   ├── analysis/page.tsx # Análise completa
│   │   └── matches/page.tsx  # Histórico de partidas
│   ├── champions/page.tsx    # Tier list (em breve)
│   └── leaderboard/page.tsx  # Rankings (em breve)
│
├── components/
│   ├── ui/                   # Componentes base (Card, Badge, Button, etc.)
│   ├── common/               # SearchBar, Loading
│   ├── layout/               # Header, Footer
│   ├── summoner/             # SummonerHeader, MatchHistory
│   ├── analysis/             # PerformanceRadar, Diagnostics, Trends
│   └── champion/             # ChampionCard
│
├── hooks/                    # TanStack Query hooks
│   ├── useSummoner.ts
│   ├── useMatches.ts
│   ├── useAnalysis.ts
│   └── useChampions.ts
│
├── lib/                      # Utilitários core
│   ├── api.ts                # Fetch client tipado
│   ├── constants.ts          # Data Dragon, regions, colors
│   ├── utils.ts              # Formatação, CN helper
│   └── providers.tsx         # QueryClient provider
│
├── types/                    # TypeScript types
│   ├── summoner.ts
│   ├── match.ts
│   ├── analysis.ts
│   └── champion.ts
│
└── styles/
    └── globals.css           # Tailwind 4 + tema dark gaming
```

## Setup

```bash
# Instalar dependências
npm install

# Copiar env
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev
```

O frontend roda em `http://localhost:3000` e se conecta ao backend em `http://localhost:8000/api`.

## Design System

### Cores

O tema dark gaming usa uma paleta de midnight blue com acentos em cyan elétrico e gold:

- `--color-bg-primary: #0a0e1a` — Background principal
- `--color-cyan-glow: #06b6d4` — Accent principal
- `--color-gold-accent: #f59e0b` — Destaques
- `--color-win: #22c55e` — Vitória
- `--color-loss: #ef4444` — Derrota

### Fontes

- **Display**: Rajdhani (headings, scores, labels)
- **Body**: Plus Jakarta Sans (texto, parágrafos)
- **Mono**: JetBrains Mono (código, dados numéricos)

### Componentes

Todos os componentes UI seguem o padrão de design tokens via CSS variables. As cores de rank, dimensões de performance e severidade de diagnósticos são semânticas.

## Boas Práticas

| Princípio | Aplicação |
|---|---|
| **Strict TypeScript** | `strict: true`, `noUncheckedIndexedAccess` |
| **Server Components** | Layout e metadata via RSC, interatividade no client |
| **Colocation** | Types, hooks e componentes próximos de onde são usados |
| **Composition** | Componentes pequenos e composáveis |
| **Error Boundaries** | `error.tsx` em cada rota dinâmica |
| **Loading States** | `loading.tsx` + Skeleton components |
| **Query Keys** | Factory pattern para TanStack Query |
| **DRY** | Utils compartilhados, Score/Badge/Card reutilizáveis |

## Scripts

```bash
npm run dev          # Dev server com Turbopack
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
npm run lint:fix     # ESLint autofix
npm run type-check   # TypeScript check
npm run format       # Prettier format
npm run format:check # Prettier check
```

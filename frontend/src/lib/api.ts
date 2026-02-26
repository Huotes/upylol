/**
 * API client for communicating with the FastAPI backend.
 * Uses Next.js rewrite proxy (/api → backend) to avoid CORS.
 */

const API_BASE = "/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? "Unknown error");
  }

  return res.json() as Promise<T>;
}

/* ── Endpoints ──────────────────────────────────── */

export const api = {
  player: {
    get: (platform: string, gameName: string, tagLine: string) =>
      request(`/player/${platform}/${gameName}/${tagLine}`),
    seasonStats: (
      platform: string,
      gameName: string,
      tagLine: string,
      season = "current",
    ) =>
      request(
        `/player/${platform}/${gameName}/${tagLine}/season-stats?season=${encodeURIComponent(season)}`,
      ),
  },

  matches: {
    list: (puuid: string, platform = "br1", count = 20, queue?: number) => {
      const params = new URLSearchParams({
        platform,
        count: String(count),
      });
      if (queue !== undefined) params.set("queue", String(queue));
      return request(`/matches/${puuid}?${params}`);
    },
    detail: (matchId: string, puuid: string, platform = "br1", tier = "SILVER") => {
      const params = new URLSearchParams({ puuid, platform, tier });
      return request(`/matches/${matchId}/detail?${params}`);
    },
  },

  analysis: {
    get: (
      platform: string,
      gameName: string,
      tagLine: string,
      count = 30,
      role = "",
    ) => {
      const params = new URLSearchParams({ count: String(count) });
      if (role) params.set("role", role);
      return request(`/analysis/${platform}/${gameName}/${tagLine}?${params}`);
    },
  },

  champions: {
    get: (puuid: string, platform = "br1", count = 30) =>
      request(`/champions/${puuid}?platform=${platform}&count=${count}`),
  },
} as const;

export { ApiError };

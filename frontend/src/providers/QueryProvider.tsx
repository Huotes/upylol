"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fairly stable — keep in cache for 5 min
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 min (avoids refetch on nav back)
            gcTime: 10 * 60 * 1000,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

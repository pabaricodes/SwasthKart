import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60s — matches CDN TTL
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

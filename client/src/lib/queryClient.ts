import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // If we're on the login page, don't make protected API calls
      if (window.location.pathname === "/login" && 
          (queryKey[0] as string).includes("/api/") && 
          !(queryKey[0] as string).includes("/api/auth/")) {
        console.log(`Skipping protected API call ${queryKey[0]} on login page`);
        return null;
      }

      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Received 401 for ${queryKey[0]}, returning null`);
        return null;
      }

      if (unauthorizedBehavior === "redirect" && res.status === 401) {
        // Use wouter's location API instead of window.location for react-friendly navigation
        if (window.location.pathname !== "/login") {
          console.log(`Received 401 for ${queryKey[0]}, redirecting to login`);
          window.location.href = "/login";
        }
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      if (unauthorizedBehavior === "redirect" && 
          error instanceof Error && 
          error.message.includes("401") && 
          window.location.pathname !== "/login") {
        console.log("Error 401, redirecting to login");
        window.location.href = "/login";
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "redirect" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

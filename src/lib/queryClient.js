import { QueryClient } from "@tanstack/react-query";

/**
 * Shared query client.
 *
 * Defaults are tuned for a catalogue site: product and category data changes on
 * admin action, not second by second, so aggressive refetching only burns
 * requests and makes the UI flicker.
 *
 * - staleTime 5m       a browsing session reuses cached listings instead of
 *                      refetching every time someone navigates back
 * - gcTime 30m         keeps data around long enough for back-navigation to be
 *                      instant
 * - no refetchOnFocus  tab-switching should not re-request the whole catalogue
 * - retry 1, but never on 4xx — a 401/404 will not fix itself on retry, and
 *   retrying a 401 races the axios interceptor that redirects to /login
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                const status = error?.response?.status;
                if (status >= 400 && status < 500) return false;
                return failureCount < 1;
            },
        },
        mutations: {
            retry: false,
        },
    },
});

export default queryClient;

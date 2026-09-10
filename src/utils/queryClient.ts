import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: WEEK_MS,
			gcTime: MONTH_MS,
			retry: 1,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		},
	},
});

if (typeof window !== 'undefined') {
	const persister = createSyncStoragePersister({
		storage: window.localStorage,
		key: 'portfolio-query-cache',
	});
	persistQueryClient({
		queryClient,
		persister,
		maxAge: MONTH_MS,
		dehydrateOptions: {
			// Never persist live/ephemeral state: a week-old "Now Playing"
			// track must not paint as live on first load. (The query still
			// caches in memory with the 30s poll; it just isn't restored
			// from localStorage.)
			shouldDehydrateQuery: (query) => query.queryKey[0] !== 'spotify-now-playing',
		},
	});
}

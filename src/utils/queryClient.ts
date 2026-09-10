import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
// gcTime feeds a raw setTimeout (Removable.scheduleGc in @tanstack/query-core).
// Timer delays are 32-bit signed ints: anything over 2^31-1 ms (~24.8 days)
// fires almost immediately, which garbage-collected idle prefetched queries
// the moment their fetch settled (only observed queries like spotify
// survived). MONTH_MS overflows — cap gcTime below the limit.
const GC_MS = 24 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: WEEK_MS,
			gcTime: GC_MS,
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

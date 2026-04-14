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
	});
}

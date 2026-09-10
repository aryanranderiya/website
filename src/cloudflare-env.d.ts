// Minimal typing for the Cloudflare Workers runtime import used by SSR
// routes (`import { env } from 'cloudflare:workers'`). A full
// `@cloudflare/workers-types` reference is intentionally avoided: it
// declares worker-flavoured globals (Response.json(): unknown, …) that
// shadow the DOM lib this project type-checks against.
declare module 'cloudflare:workers' {
	export const env: Record<string, string | undefined>;
}

interface Env {
  TRY_API_ORIGIN?: string;
}

const DEFAULT_ORIGIN = 'https://try-api-566740938284.us-central1.run.app';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = env.TRY_API_ORIGIN ?? DEFAULT_ORIGIN;
  const incoming = new URL(request.url);
  // Strip the `/api` prefix so requests land on the Nest route tree
  // unchanged. This matches vite's dev proxy (`rewrite: p => p.replace(/^\/api/, '')`),
  // keeping the backend identical between local dev and Cloud Run.
  const forwardedPath = incoming.pathname.replace(/^\/api/, '') || '/';
  const target = new URL(forwardedPath + incoming.search, origin);

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  return fetch(target.toString(), init);
};

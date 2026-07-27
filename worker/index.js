/**
 * Cloudflare Worker entry point used by OpenAI Sites.
 * The lo-fi prototype is client-only, so every request is served from the
 * generated static asset bundle.
 */
export default {
    async fetch(request, env) {
        const response = await env.ASSETS.fetch(request);

        if (response.status !== 404 || request.method !== "GET") {
            return response;
        }

        const fallbackUrl = new URL("/index.html", request.url);
        return env.ASSETS.fetch(new Request(fallbackUrl, request));
    },
};

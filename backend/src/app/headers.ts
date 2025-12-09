import { RouteMiddleware } from "rwsdk/router";

export const setCommonHeaders =
	(): RouteMiddleware =>
	({ response, rw: { nonce } }) => {
		if (!import.meta.env.VITE_IS_DEV_SERVER) {
			// Forces browsers to always use HTTPS for a specified time period (2 years)
			response.headers.set(
				"Strict-Transport-Security",
				"max-age=63072000; includeSubDomains; preload"
			);
		}

		// Forces browser to use the declared content-type instead of trying to guess/sniff it
		response.headers.set("X-Content-Type-Options", "nosniff");

		// Stops browsers from sending the referring webpage URL in HTTP headers
		response.headers.set("Referrer-Policy", "no-referrer");

		// Explicitly disables access to specific browser features/APIs
		response.headers.set(
			"Permissions-Policy",
			"geolocation=(), microphone=(), camera=()"
		);

		// Defines trusted sources for content loading and script execution:
		response.headers.set(
			"Content-Security-Policy",
			`default-src 'self'; script-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://challenges.cloudflare.com https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; frame-ancestors *; frame-src 'self' https://challenges.cloudflare.com https://rwsdk.com; worker-src 'self' blob:; child-src 'self' blob:; object-src 'none';`
		);

		// CORS, Allow all for now
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	};

// Utility function for CORS preflight OPTIONS responses
export const corsPreflightResponse = (methods: string) => {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": methods,
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Max-Age": "86400",
		},
	});
};

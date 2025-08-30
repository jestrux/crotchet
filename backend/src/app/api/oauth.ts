import crypto from "crypto";

export const generateOauthUrl = async ({
	url,
	redirectUrl,
	request,
}: {
	url: string;
	redirectUrl: string;
	request: Request;
}) => {
	const generateRandomString = (length: number): string => {
		const possible: string =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const values: Uint8Array = crypto.getRandomValues(
			new Uint8Array(length)
		);
		return values.reduce(
			(acc: string, x: number): string =>
				acc + possible[x % possible.length],
			""
		);
	};

	const sha256 = async (plain: string | undefined) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(plain);
		return crypto.subtle.digest("SHA-256", data);
	};

	const base64encode = (input: ArrayBuffer) => {
		return btoa(String.fromCharCode(...new Uint8Array(input)))
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	};

	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);

	let params = Object.fromEntries(new URL(url).searchParams.entries());

	const stateUrl = new URL(redirectUrl);
	const redirect_uri = request.url.replace("/oauth", "/oauth-callback");
	stateUrl.searchParams.set("code_verifier", codeVerifier);
	stateUrl.searchParams.set("redirect_uri", redirect_uri);

	params = {
		response_type: "code",
		code_challenge_method: "S256",
		code_challenge: codeChallenge,
		...(params || {}),
		// state: generateRandomString(64),
		state: encodeURIComponent(stateUrl.toString()),
		redirect_uri,
	};

	const authUrl = new URL(url);
	authUrl.search = new URLSearchParams(params).toString();

	return authUrl;
};

export const exchangeCodeForAuthToken = async (redirectUrl: string) => {
	const { from_oauth, preferenceKey, tokenExchangeUrl, ...redirectData } =
		Object.fromEntries(new URL(redirectUrl).searchParams.entries());

	const res = await fetch(tokenExchangeUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			...redirectData,
			grant_type: "authorization_code",
		}),
	});

	if (!res.ok) throw "Token exchange failed. Please check and try again.";

	return await res.json();
};

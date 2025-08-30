import {
	getBackendBaseUrl,
	getToken,
	onDesktop,
	saveToken,
} from "@/crotchet/utils";
import openUrl from "../open-url";

const refreshOAuthToken = async ({
	tokenExchangeUrl,
	preferenceKey,
	params,
}) => {
	try {
		let savedToken = await getToken(preferenceKey);

		if (!savedToken?.refresh_token) return null;

		const res = await fetch(tokenExchangeUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				...params,
				grant_type: "refresh_token",
				refresh_token: savedToken.refresh_token,
			}),
		});

		if (!res.ok) throw "Invalid token. Please check and try again.";

		const tokenDetails = await res.json();

		await saveToken(preferenceKey, {
			...tokenDetails,
			expires_at: Date.now() + 1000 * tokenDetails.expires_in,
		});

		return tokenDetails;
	} catch (error) {
		return null;
	}
};

export const handleOauthRedirect = async (args) => {
	if (!args) return null;

	try {
		const tokenData = _.omit(args, ["from_oauth", "preferenceKey"]);

		await saveToken(args.preferenceKey, {
			...tokenData,
			expires_at: Date.now() + 1000 * tokenData.expires_in,
		});

		// alert(
		// 	JSON.stringify({
		// 		message: "Oauth complete",
		// 		tokenData,
		// 	})
		// );
	} catch (error) {
		// alert(
		// 	JSON.stringify({
		// 		message: "Oauth redirect error",
		// 		error: error?.message || error,
		// 	})
		// );
	}
};

export const oauth = async ({
	params,
	authorizeUrl,
	tokenExchangeUrl,
	preferenceKey,
	readOnly,
} = {}) => {
	if (readOnly) {
		const savedToken = await getToken(preferenceKey);
		const accessToken = savedToken?.access_token;
		const expiresAt = savedToken?.expires_at ?? Date.now() - 20 * 1000;

		if (!accessToken) return null;

		if (Date.now() > expiresAt) {
			return (
				await refreshOAuthToken({
					tokenExchangeUrl,
					preferenceKey,
					params,
				})
			)?.access_token;
		}

		return accessToken;
	}

	const authUrl = new URL(authorizeUrl);
	params = {
		...Object.fromEntries(new URL(authUrl).searchParams.entries()),
		...(params || {}),
	};
	authUrl.search = new URLSearchParams(params).toString();
	const redirectUrl = new URL(window.oatuhRedirectBaseUrl ?? "crotchet://");
	redirectUrl.search = new URLSearchParams({
		...params,
		tokenExchangeUrl,
		preferenceKey,
	}).toString();

	let proxyAuthResponse;
	try {
		proxyAuthResponse = await fetch(`${getBackendBaseUrl()}/oauth`, {
			method: "POST",
			body: JSON.stringify({
				url: authUrl.toString(),
				redirectUrl,
			}),
		}).then((res) => res.json());
	} catch (error) {
		// alert(
		// 	JSON.stringify({
		// 		"Get Oauth proxy url error": error.message || error,
		// 	})
		// );
	}

	if (!proxyAuthResponse) return alert("Get Oauth proxy url unknown error");

	const proxyAuthUrl = proxyAuthResponse;

	if (onDesktop()) return openUrl(proxyAuthUrl);

	return window.open(proxyAuthUrl, "_self");
};

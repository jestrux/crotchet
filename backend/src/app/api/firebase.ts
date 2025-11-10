import { env } from "cloudflare:workers";

export interface NotificationOptions {
	topic: string;
	title: string;
	body: string;
	data?: Record<string, string>;
}

export interface SubscriptionOptions {
	token: string;
	topic: string;
}

interface ServiceAccount {
	project_id: string;
	private_key: string;
	client_email: string;
}

// Cache for access token
let cachedToken: { token: string; expiry: number } | null = null;

/**
 * Generate a JWT using the service account private key
 */
async function createJWT(serviceAccount: ServiceAccount): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const expiry = now + 3600; // 1 hour

	const header = {
		alg: "RS256",
		typ: "JWT",
	};

	const payload = {
		iss: serviceAccount.client_email,
		sub: serviceAccount.client_email,
		aud: "https://oauth2.googleapis.com/token",
		iat: now,
		exp: expiry,
		scope: "https://www.googleapis.com/auth/firebase.messaging",
	};

	// Encode header and payload
	const encodedHeader = btoa(JSON.stringify(header))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	const encodedPayload = btoa(JSON.stringify(payload))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	const unsignedToken = `${encodedHeader}.${encodedPayload}`;

	// Import the private key
	const privateKey = serviceAccount.private_key;
	const pemContents = privateKey
		.replace("-----BEGIN PRIVATE KEY-----", "")
		.replace("-----END PRIVATE KEY-----", "")
		.replace(/\s/g, "");

	const binaryKey = Uint8Array.from(atob(pemContents), (c) =>
		c.charCodeAt(0)
	);

	const cryptoKey = await crypto.subtle.importKey(
		"pkcs8",
		binaryKey,
		{
			name: "RSASSA-PKCS1-v1_5",
			hash: "SHA-256",
		},
		false,
		["sign"]
	);

	// Sign the token
	const signature = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		cryptoKey,
		new TextEncoder().encode(unsignedToken)
	);

	// Encode signature
	const encodedSignature = btoa(
		String.fromCharCode(...new Uint8Array(signature))
	)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Exchange JWT for an OAuth access token
 */
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
	// Check cache
	if (cachedToken && cachedToken.expiry > Date.now()) {
		return cachedToken.token;
	}

	const jwt = await createJWT(serviceAccount);

	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: jwt,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to get access token: ${error}`);
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};

	// Cache the token (expire 5 minutes early to be safe)
	cachedToken = {
		token: data.access_token,
		expiry: Date.now() + (data.expires_in - 300) * 1000,
	};

	return data.access_token;
}

/**
 * Subscribe a device token to a Firebase topic
 */
export async function subscribeToTopic(options: SubscriptionOptions) {
	try {
		if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
			throw new Error(
				"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
			);
		}

		const serviceAccount: ServiceAccount = JSON.parse(
			env.FIREBASE_SERVICE_ACCOUNT_JSON
		);

		// Get OAuth access token
		const accessToken = await getAccessToken(serviceAccount);

		// Subscribe to topic using IID API
		const iidUrl = `https://iid.googleapis.com/iid/v1/${options.token}/rel/topics/${options.topic}`;

		const response = await fetch(iidUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Failed to subscribe to topic: ${error}`);
		}

		return {
			success: true,
			message: `Successfully subscribed to topic: ${options.topic}`,
		};
	} catch (error) {
		console.error("Error subscribing to Firebase topic:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Unsubscribe a device token from a Firebase topic
 */
export async function unsubscribeFromTopic(options: SubscriptionOptions) {
	try {
		if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
			throw new Error(
				"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
			);
		}

		const serviceAccount: ServiceAccount = JSON.parse(
			env.FIREBASE_SERVICE_ACCOUNT_JSON
		);

		// Get OAuth access token
		const accessToken = await getAccessToken(serviceAccount);

		// Unsubscribe from topic using IID API
		const iidUrl = `https://iid.googleapis.com/iid/v1/${options.token}/rel/topics/${options.topic}`;

		const response = await fetch(iidUrl, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Failed to unsubscribe from topic: ${error}`);
		}

		return {
			success: true,
			message: `Successfully unsubscribed from topic: ${options.topic}`,
		};
	} catch (error) {
		console.error("Error unsubscribing from Firebase topic:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Send a notification to a Firebase topic using FCM REST API
 */
export async function sendTopicNotification(options: NotificationOptions) {
	try {
		if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
			throw new Error(
				"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
			);
		}

		const serviceAccount: ServiceAccount = JSON.parse(
			env.FIREBASE_SERVICE_ACCOUNT_JSON
		);

		// Get OAuth access token
		const accessToken = await getAccessToken(serviceAccount);

		// Construct FCM message with platform-specific options
		const message: any = {
			message: {
				topic: options.topic,
				notification: {
					title: options.title,
					body: options.body,
				},
				// Android-specific options
				android: {
					priority: "high",
					notification: {
						sound: "default",
						channel_id: "default",
					},
				},
				// iOS-specific options
				apns: {
					headers: {
						"apns-priority": "10",
					},
					payload: {
						aps: {
							sound: "default",
							badge: 1,
						},
					},
				},
			},
		};

		// Add optional data payload
		if (options.data) {
			message.message.data = options.data;
		}

		// Send notification via FCM REST API
		const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

		const response = await fetch(fcmUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(message),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`FCM API error: ${error}`);
		}

		const result = (await response.json()) as { name: string };

		return {
			success: true,
			messageId: result.name,
		};
	} catch (error) {
		console.error("Error sending Firebase notification:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

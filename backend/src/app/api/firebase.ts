import { env } from "cloudflare:workers";

export interface NotificationOptions {
	topic: string;
	title: string;
	body: string;
	data?: Record<string, string>;
	silent?: boolean;
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

// Cache for access tokens (keyed by scope)
const tokenCache: Map<string, { token: string; expiry: number }> = new Map();

/**
 * Generate a JWT using the service account private key
 */
async function createJWT(serviceAccount: ServiceAccount, scope: string): Promise<string> {
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
		scope,
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
async function getAccessToken(serviceAccount: ServiceAccount, scope: string): Promise<string> {
	// Check cache for this scope
	const cached = tokenCache.get(scope);
	if (cached && cached.expiry > Date.now()) {
		return cached.token;
	}

	const jwt = await createJWT(serviceAccount, scope);

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
	tokenCache.set(scope, {
		token: data.access_token,
		expiry: Date.now() + (data.expires_in - 300) * 1000,
	});

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
		const accessToken = await getAccessToken(serviceAccount, "https://www.googleapis.com/auth/firebase.messaging");

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
		const accessToken = await getAccessToken(serviceAccount, "https://www.googleapis.com/auth/firebase.messaging");

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
		const accessToken = await getAccessToken(serviceAccount, "https://www.googleapis.com/auth/firebase.messaging");

		// Construct FCM message with platform-specific options
		const message: any = {
			message: {
				topic: options.topic,
			},
		};

		if (options.silent) {
			// Silent notification - data only, no system notification
			message.message.data = {
				title: options.title,
				body: options.body,
				...(options.data || {}),
			};
			message.message.apns = {
				headers: {
					"apns-priority": "10",
				},
				payload: {
					aps: {
						"content-available": 1,
					},
				},
			};
		} else {
			// Regular notification with system UI
			message.message.notification = {
				title: options.title,
				body: options.body,
			};
			message.message.android = {
				priority: "high",
				notification: {
					sound: "default",
					channel_id: "default",
				},
			};
			message.message.apns = {
				headers: {
					"apns-priority": "10",
				},
				payload: {
					aps: {
						sound: "default",
						badge: 1,
					},
				},
			};

			// Add data payload if provided
			if (options.data) {
				message.message.data = options.data;
			}
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

// ============================================================================
// FIRESTORE DATABASE FUNCTIONS
// ============================================================================

/**
 * Get Firestore access token
 */
async function getFirestoreToken(): Promise<string> {
	if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
		);
	}

	const serviceAccount: ServiceAccount = JSON.parse(
		env.FIREBASE_SERVICE_ACCOUNT_JSON
	);

	return getAccessToken(
		serviceAccount,
		"https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform"
	);
}

/**
 * Get Storage access token
 */
async function getStorageToken(): Promise<string> {
	if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
		);
	}

	const serviceAccount: ServiceAccount = JSON.parse(
		env.FIREBASE_SERVICE_ACCOUNT_JSON
	);

	return getAccessToken(serviceAccount, "https://www.googleapis.com/auth/devstorage.full_control");
}

/**
 * Get the Firestore base URL
 */
function getFirestoreBaseUrl(): string {
	if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
		);
	}

	const serviceAccount: ServiceAccount = JSON.parse(
		env.FIREBASE_SERVICE_ACCOUNT_JSON
	);

	return `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents`;
}

/**
 * Convert Firestore document to plain object
 */
function convertFirestoreDoc(doc: any): any {
	if (!doc || !doc.fields) return null;

	const result: any = {
		_rowId: doc.name?.split("/").pop() || null,
		_id: doc.name?.split("/").pop() || null,
	};

	for (const [key, value] of Object.entries(doc.fields as any)) {
		if (value.stringValue !== undefined) {
			result[key] = value.stringValue;
		} else if (value.integerValue !== undefined) {
			result[key] = parseInt(value.integerValue);
		} else if (value.doubleValue !== undefined) {
			result[key] = value.doubleValue;
		} else if (value.booleanValue !== undefined) {
			result[key] = value.booleanValue;
		} else if (value.timestampValue !== undefined) {
			result[key] = new Date(value.timestampValue).getTime();
		} else if (value.nullValue !== undefined) {
			result[key] = null;
		} else if (value.mapValue !== undefined) {
			result[key] = convertFirestoreDoc({ fields: value.mapValue.fields });
		} else if (value.arrayValue !== undefined) {
			result[key] = value.arrayValue.values?.map((v: any) => {
				if (v.stringValue !== undefined) return v.stringValue;
				if (v.integerValue !== undefined) return parseInt(v.integerValue);
				if (v.doubleValue !== undefined) return v.doubleValue;
				if (v.booleanValue !== undefined) return v.booleanValue;
				if (v.timestampValue !== undefined)
					return new Date(v.timestampValue).getTime();
				return null;
			}) || [];
		}
	}

	return result;
}

/**
 * Convert plain object to Firestore document format
 */
function convertToFirestoreDoc(data: any): any {
	const fields: any = {};

	for (const [key, value] of Object.entries(data)) {
		// Skip internal fields
		if (key.startsWith("_")) continue;

		if (value === null || value === undefined) {
			fields[key] = { nullValue: null };
		} else if (typeof value === "string") {
			fields[key] = { stringValue: value };
		} else if (typeof value === "number") {
			if (Number.isInteger(value)) {
				fields[key] = { integerValue: value.toString() };
			} else {
				fields[key] = { doubleValue: value };
			}
		} else if (typeof value === "boolean") {
			fields[key] = { booleanValue: value };
		} else if (value instanceof Date) {
			fields[key] = { timestampValue: value.toISOString() };
		} else if (Array.isArray(value)) {
			fields[key] = {
				arrayValue: {
					values: value.map((v) => {
						if (typeof v === "string") return { stringValue: v };
						if (typeof v === "number")
							return Number.isInteger(v)
								? { integerValue: v.toString() }
								: { doubleValue: v };
						if (typeof v === "boolean") return { booleanValue: v };
						return { nullValue: null };
					}),
				},
			};
		} else if (typeof value === "object") {
			fields[key] = { mapValue: convertToFirestoreDoc(value) };
		}
	}

	return { fields };
}

/**
 * Get database table path
 */
function dbTablePath(table: string): string {
	return `__db/${table}/data`;
}

/**
 * Simple search implementation (inspired by match-sorter)
 * Searches for query string in specified fields
 */
function searchDocs(docs: any[], searchQuery: string, searchFields: string[]): any[] {
	if (!searchQuery || searchQuery.length === 0) return docs;

	const query = searchQuery.toLowerCase();

	return docs
		.map((doc) => {
			let score = 0;
			const matches: string[] = [];

			for (const field of searchFields) {
				const value = doc[field];
				if (!value) continue;

				const valueStr = Array.isArray(value)
					? value.join(" ").toLowerCase()
					: value.toString().toLowerCase();

				if (valueStr === query) {
					score += 10; // Exact match
					matches.push(field);
				} else if (valueStr.startsWith(query)) {
					score += 5; // Starts with
					matches.push(field);
				} else if (valueStr.includes(query)) {
					score += 1; // Contains
					matches.push(field);
				}
			}

			return { doc, score, matches };
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.map((result) => result.doc);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Query database
 */
export async function queryDb(
	table: string,
	options: {
		rowId?: string;
		orderBy?: string;
		filters?: Record<string, any>;
		limit?: number;
		first?: boolean;
		random?: boolean;
		shuffle?: boolean;
		searchable?: boolean;
		searchQuery?: string;
		searchFields?: string[];
		fieldMap?: Record<string, any>;
	} = {}
): Promise<any> {
	const token = await getFirestoreToken();
	const baseUrl = getFirestoreBaseUrl();
	const collectionPath = dbTablePath(table);

	// If rowId is provided, get single document
	if (options.rowId) {
		const url = `${baseUrl}/${collectionPath}/${options.rowId}`;
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`Failed to get document: ${await response.text()}`);
		}

		const doc = await response.json();
		return convertFirestoreDoc(doc);
	}

	// Build structured query - fetch all documents (no Firebase filtering to avoid index requirements)
	const structuredQuery: any = {
		from: [{ collectionId: "data" }],
	};

	const url = `${baseUrl}/__db/${table}:runQuery`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ structuredQuery }),
	});

	if (!response.ok) {
		throw new Error(`Failed to query documents: ${await response.text()}`);
	}

	const results = await response.json();

	// Filter out empty results and convert documents
	let docs = results
		.filter((result: any) => result.document)
		.map((result: any) => convertFirestoreDoc(result.document));

	// Apply field mapping first (before filters)
	if (options.fieldMap && Object.keys(options.fieldMap).length > 0) {
		docs = docs.map((doc: any) => {
			const mappedFields: any = {};
			for (const [key, value] of Object.entries(options.fieldMap!)) {
				if (typeof value === "function") {
					mappedFields[key] = value(doc);
				} else if (typeof value === "string") {
					// Simple field rename: { newName: "oldName" }
					mappedFields[key] = doc[value];
				} else {
					mappedFields[key] = value;
				}
			}
			return { ...doc, ...mappedFields };
		});
	}

	// Apply in-memory filters (inspired by useSourceGet.js)
	if (options.filters && Object.keys(options.filters).length > 0) {
		docs = docs.filter((entry: any) => {
			return Object.entries(options.filters!).every(([key, value]) => {
				let entryValue = entry[key];
				const filterValue = value
					?.toString()
					.toLowerCase()
					.replaceAll(" ", "");

				// Handle array values in entry
				if (Array.isArray(entryValue)) {
					return entryValue.some(
						(v) =>
							v
								?.toString()
								.toLowerCase()
								.replaceAll(" ", "") === filterValue
					);
				}

				// Handle simple equality
				return (
					entryValue
						?.toString()
						.toLowerCase()
						.replaceAll(" ", "") === filterValue
				);
			});
		});
	}

	// Apply search (default searchable unless explicitly disabled)
	if (
		options.searchable !== false &&
		options.searchQuery &&
		options.searchQuery.length > 0
	) {
		const searchFields = options.searchFields || [
			"title",
			"subtitle",
			"tags",
			"name",
			"description",
		];
		docs = searchDocs(docs, options.searchQuery, searchFields);
	}

	// Apply orderBy in-memory
	if (options.orderBy) {
		const [field, direction] = options.orderBy.split(",");
		docs.sort((a: any, b: any) => {
			const aVal = a[field];
			const bVal = b[field];

			if (aVal === bVal) return 0;
			if (aVal == null) return 1;
			if (bVal == null) return -1;

			const comparison = aVal < bVal ? -1 : 1;
			return direction?.toUpperCase() === "DESC" ? -comparison : comparison;
		});
	}

	// Apply shuffle first
	if (options.shuffle) {
		docs = shuffleArray(shuffleArray(docs)); // Double shuffle like your code
	}

	// Apply first (returns first document)
	if (options.first) {
		return docs[0] || null;
	}

	// Apply random (returns random document)
	if (options.random) {
		const shuffled = shuffleArray(docs);
		return shuffled[0] || null;
	}

	// Apply limit
	if (options.limit) {
		docs = docs.slice(0, options.limit);
	}

	return docs;
}

/**
 * Insert document
 */
export async function dbInsert(
	table: string,
	data: any,
	options: { rowId?: string; merge?: boolean } = {}
): Promise<any> {
	const token = await getFirestoreToken();
	const baseUrl = getFirestoreBaseUrl();
	const collectionPath = dbTablePath(table);

	// Add timestamps
	const now = new Date().toISOString();
	data = {
		...data,
		createdAt: now,
		updatedAt: now,
	};

	const firestoreDoc = convertToFirestoreDoc(data);

	let url: string;
	let method: string;

	if (options.rowId) {
		// Update existing document
		url = `${baseUrl}/${collectionPath}/${options.rowId}`;
		method = "PATCH";
		if (options.merge) {
			// Get existing field paths to merge - each field needs its own parameter
			const fieldPaths = Object.keys(data)
				.map((key) => `updateMask.fieldPaths=${key}`)
				.join("&");
			url += `?${fieldPaths}`;
		}
	} else {
		// Create new document
		url = `${baseUrl}/${collectionPath}`;
		method = "POST";
	}

	const response = await fetch(url, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(firestoreDoc),
	});

	if (!response.ok) {
		throw new Error(`Failed to insert document: ${await response.text()}`);
	}

	const doc = await response.json();
	return convertFirestoreDoc(doc);
}

/**
 * Update document
 */
export async function dbUpdate(
	table: string,
	rowId: string,
	data: any,
	options: { merge?: boolean } = {}
): Promise<any> {
	const token = await getFirestoreToken();
	const baseUrl = getFirestoreBaseUrl();
	const collectionPath = dbTablePath(table);

	// Add updatedAt timestamp
	data = {
		...data,
		updatedAt: new Date().toISOString(),
	};

	// Remove createdAt if present
	delete data.createdAt;

	const firestoreDoc = convertToFirestoreDoc(data);

	let url = `${baseUrl}/${collectionPath}/${rowId}`;
	if (options.merge) {
		// Get existing field paths to merge - each field needs its own parameter
		const fieldPaths = Object.keys(data)
			.map((key) => `updateMask.fieldPaths=${key}`)
			.join("&");
		url += `?${fieldPaths}`;
	}

	const response = await fetch(url, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(firestoreDoc),
	});

	if (!response.ok) {
		throw new Error(`Failed to update document: ${await response.text()}`);
	}

	const doc = await response.json();
	return convertFirestoreDoc(doc);
}

/**
 * Delete document
 */
export async function dbDelete(table: string, rowId: string): Promise<void> {
	const token = await getFirestoreToken();
	const baseUrl = getFirestoreBaseUrl();
	const collectionPath = dbTablePath(table);

	const url = `${baseUrl}/${collectionPath}/${rowId}`;

	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to delete document: ${await response.text()}`);
	}
}

// ============================================================================
// FIREBASE STORAGE FUNCTIONS
// ============================================================================

/**
 * Upload raw string to Firebase Storage
 */
export async function uploadRawString(
	content: string,
	options: { name?: string; type?: string } = {}
): Promise<string> {
	const token = await getStorageToken();

	if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
		);
	}

	const serviceAccount: ServiceAccount = JSON.parse(
		env.FIREBASE_SERVICE_ACCOUNT_JSON
	);

	// Generate random ID for filename
	const randomId = Math.random().toString(36).substring(2, 15);
	const name = options.name || `${randomId}.txt`;
	const type = options.type || "text/plain";

	const storageBucket = env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
	const filePath = `crotchet-uploads/file-${name}`;

	const url = `https://storage.googleapis.com/upload/storage/v1/b/${storageBucket}/o?uploadType=media&name=${encodeURIComponent(filePath)}`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": type,
		},
		body: content,
	});

	if (!response.ok) {
		throw new Error(`Failed to upload file: ${await response.text()}`);
	}

	// Return public download URL
	return `https://storage.googleapis.com/${storageBucket}/${filePath}`;
}

/**
 * Upload string as file to Firebase Storage
 */
export async function uploadStringAsFile(
	content: string,
	options: { name?: string; type?: string } = {}
): Promise<string> {
	// For string uploads, same as uploadRawString
	return uploadRawString(content, options);
}

/**
 * Upload data URL to Firebase Storage
 */
export async function uploadDataUrl(dataUrl: string): Promise<string> {
	const token = await getStorageToken();

	if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		throw new Error(
			"FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set"
		);
	}

	const serviceAccount: ServiceAccount = JSON.parse(
		env.FIREBASE_SERVICE_ACCOUNT_JSON
	);

	// Parse data URL
	const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);
	if (!matches) {
		throw new Error("Invalid data URL format");
	}

	const contentType = matches[1];
	const base64Data = matches[2];

	// Decode base64
	const binaryString = atob(base64Data);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	// Generate random ID for filename
	const randomId = Math.random().toString(36).substring(2, 15);
	const extension = contentType.split("/")[1] || "bin";
	const name = `${randomId}.${extension}`;

	const storageBucket = env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;
	const filePath = `crotchet-uploads/file-${name}`;

	const url = `https://storage.googleapis.com/upload/storage/v1/b/${storageBucket}/o?uploadType=media&name=${encodeURIComponent(filePath)}`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": contentType,
		},
		body: bytes,
	});

	if (!response.ok) {
		throw new Error(`Failed to upload file: ${await response.text()}`);
	}

	// Return public download URL
	return `https://storage.googleapis.com/${storageBucket}/${filePath}`;
}

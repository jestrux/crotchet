import "../../@types/index";

const basicTokenKey = "spotifyTokenBasicToken";
const tokenKey = "spotifyToken";
const appIconPath =
	"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z";
const appIcon = UI.svg(appIconPath, {
	filled: true,
});
const appColor = "#03BD7D";
const connectionChangedEvent = "spotify-connection-changed";

const client_id = "383620f73a0d43d9a90bbce3c874a23e";
const client_secret = "4fcbe9a340d349c984a0455dc94caf6a";

const authorizeUrl = "https://accounts.spotify.com/authorize";
const tokenUrl = "https://accounts.spotify.com/api/token";

const scope = [
	"user-read-currently-playing",
	"app-remote-control",
	"streaming",
	"playlist-read-private",
	"user-follow-read",
	"user-top-read",
	"user-read-recently-played",
	"user-library-read",
].join(" ");

const authenticate = (readOnly = false) =>
	oauth({
		authorizeUrl,
		tokenExchangeUrl: tokenUrl,
		preferenceKey: tokenKey,
		params: {
			client_id,
			scope,
		},
		readOnly,
	});

async function getBasicToken() {
	let savedToken = await getToken(basicTokenKey);

	if (!savedToken) {
		try {
			const res = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization:
						"Basic " +
						btoa(client_id + ":" + client_secret).toString(
							// @ts-ignore
							"base64"
						),
				},
				body: `${encodeURIComponent("grant_type")}=${encodeURIComponent(
					"client_credentials"
				)}`,
			});

			const tokenDetails = await res.json();
			savedToken = tokenDetails.access_token;
			await saveToken(basicTokenKey, savedToken, tokenDetails.expires_in);
		} catch (error) {
			//
		}
	}

	return savedToken;
}

const querySpotify = async (endpoint = "/me") => {
	let token = endpoint.startsWith("/me")
		? await authenticate(true)
		: await getBasicToken();

	if (!token) throw "No token provided";

	try {
		return await withCache(
			`https://api.spotify.com/v1${endpoint}`,
			async () => {
				const response = await fetch(
					`https://api.spotify.com/v1${endpoint}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// @ts-ignore
				if (!response.ok)
					throw "Invalid token. Please check and try again.";

				// @ts-ignore
				return await response.json();
			}
		);
	} catch (error) {
		await saveToken(basicTokenKey, null);
		console.error("Error validating token:", error);
		return Response.json({
			success: false,
			error: "Failed to validate token. Please try again.",
		});
	}
};

const connectSpotify = async () => {
	try {
		await querySpotify();
		dispatch(connectionChangedEvent);
		return true;
	} catch (error) {
		showActionSheetAlert("Invalid Spotify token");
	}

	return false;
};

const promptConnectSpotify = async (callback) => {
	let response;
	try {
		response = await authenticate();
	} catch (error) {
		alert(
			JSON.stringify({
				"Spotify authenticate error": error.message || error,
			})
		);
	}
	if (response) callback();
	// return alert(JSON.stringify({ "Spotify authenticate response": response }));
};

// @ts-ignore
window.promptConnectSpotify = promptConnectSpotify;
// window.promptConnectSpotify = connectSpotify;

const openShareSheet = (entry) => {
	window.openActionSheet({
		fullScreen: true,
		preview: _.pick(entry, ["url", "image", "title", "subtitle"]),
		actions: [
			{
				label: "Open",
				icon: appIcon,
				handler: () => openUrl(entry.url),
			},
			{
				label: "Share",
				icon: UI.icon("share"),
				handler: () =>
					openUrl(`crotchet://broadcast/url/${entry.url}}`),
			},
		],
	});
};

const queryPlaylists = async () =>
	await querySpotify("/me/playlists?limit=50").then((res) =>
		res?.items.map((item) => {
			return {
				_id: item.id,
				image: item.images?.[0]?.url,
				title: item.name,
				subtitle: `by ${item.owner.display_name}`,
				url: item.external_urls?.spotify ?? item.uri,
				owner: item.owner,
			};
		})
	);

const queryArtists = async () =>
	await querySpotify("/me/following?type=artist&limit=50").then((res) =>
		res?.artists?.items.map((item) => {
			return {
				_id: item.id,
				image: item.images?.[0]?.url,
				title: item.name,
				subtitle: !item.geners?.length
					? ""
					: `Genres ${item.genres.join(",")}`,
				url: item.external_urls?.spotify ?? item.uri,
				owner: item.owner,
				meta: {
					face: true,
				},
			};
		})
	);

const queryAlbums = async () =>
	await querySpotify("/me/albums?limit=50").then((res) =>
		res?.items.map(({ album: item }) => {
			return {
				_id: item.id,
				image: item.images?.[0]?.url,
				title: item.name,
				subtitle: !item.artists?.length
					? ""
					: `By ${_.map(item.artists, "name").join(",")}`,
				url: item.external_urls?.spotify ?? item.uri,
				artists: item.artists,
			};
		})
	);

const queryTracks = async () =>
	await querySpotify("/me/tracks?limit=50").then((res) =>
		res?.items.map(({ track: item }) => {
			return {
				_id: item.id,
				image: item.album.images?.[0]?.url,
				title: item.name,
				subtitle: !item.artists?.length
					? ""
					: `By ${_.map(item.artists, "name").join(",")}`,
				url: item.external_urls?.spotify ?? item.uri,
				artists: item.artists,
			};
		})
	);

const addTrackMetadata = (track) => {
	track.metadata = {
		title: track.name,
		description: track.artists.map(({ name }) => name).join(", "),
		releaseDate: formatDate(track.releaseDate?.isoString),
		duration: toHms(track.duration),
		url: track.url,
		embedUrl: `https://open.spotify.com/embed/track/${track.id}`,
	};

	const actions = [
		...(track.preview_url
			? [
					{
						icon: UI.icon("play"),
						label: "Preview",
						handle: () => previewTrack(track),
					},
			  ]
			: []),
		{
			icon: UI.icon("open-external"),
			label: "Play",
			url: track.url,
		},
		{
			icon: UI.icon("shuffle"),
			label: "Song Radio",
			handler: async () => {
				const radioDetails = await querySpotify(
					`/recommendations?limit=50&market=US&seed_tracks=${track.id}&target_acousticness=0.1`
				);
				console.log("Radio details: ", radioDetails);
			},
		},
	];

	return {
		...track,
		url: track.url.replace("https://open.spotify.com/", "spotify://"),
		action: actions[0],
		actions,
	};
};

const getTrackDetails = async (url) => {
	const trackId = new URL(url).pathname.replace("/track/", "");
	let crawlRes = (
		await crawlUrl(
			`https://open.spotify.com/embed/track/${trackId}`,
			"#__NEXT_DATA__"
		)
	)?.[0];
	try {
		crawlRes = JSON.parse(crawlRes)?.props?.pageProps?.state?.data?.entity;
	} catch (error) {}

	if (crawlRes?.id) {
		const t = crawlRes;
		const track = {
			url: `https://open.spotify.com/track/${trackId}`,
			image: t.visualIdentity.image[0].url,
			title: t.name,
			description: t.artists.map(({ name }) => name).join(", "),
			preview_url: t.audioPreview?.url,
			duration: t.duration / 1000,
		};

		return addTrackMetadata({
			...t,
			...track,
		});
	}

	return await querySpotify(`/tracks/${trackId}`).then((track) => {
		const artwork = track.album.images[0].url;
		const album = track.album.name;
		const artist = track.artists.map(({ name }) => name).join(", ");
		const preview = track.preview_url;
		const title = track.name;

		return {
			// artwork,
			// album,
			// artist,
			// preview,
			image: artwork,
			title: `<span>
					${title}
					<span class="ml-1 opacity-50">
					&mdash; ${album}
					</span>
					</span>`,
			subtitle: artist,
			url,
			src: preview,
		};
	});
};

const previewTrack = (track) => {
	playMedia({
		...track,
		src: track.preview_url,
		actions: [
			{
				icon: appIcon,
				shortcut: "Shift + Space",
				label: "Play On Spotify",
				handler: () => {
					closePage();
					openUrl(track.url);
				},
			},
			{
				icon: appIcon,
				shortcut: "Shift + R",
				label: "Song Radio",
				handler: async () => {
					const radioDetails = await querySpotify(
						`/recommendations?limit=50&market=US&seed_tracks=${track.id}&target_acousticness=0.1`
					);
					console.log("Radio details: ", radioDetails);
				},
			},
		],
	});
};

const openSongPreviewPage = ({ url } = { url: "" }) => {
	if (!url) return;

	return openPage({
		type: "preview",
		title: ({ pageData }) => (pageData ? "" : "Preview Spotify Track"),
		resolve: async () => await getTrackDetails(url),
		onReady: ({ pageData, closePage }) => {
			if (!pageData?.preview_url) return;

			closePage();

			previewTrack(pageData);
		},
	});
};

const widgetResolverContentActions = (dataLoader, { entity = "" } = {}) => ({
	resolve: async () => {
		try {
			const res = await dataLoader();
			return await sourceGet(
				{
					handler: () => res,
				},
				{
					limit: 5,
					random: true,
				}
			);
		} catch (error) {
			console.log(
				`Failed to fetch ${entity || "spotify widget data"}: `,
				error
			);
		}

		return "no token";
	},
	content: ({ data, loading }) => {
		if (loading) return;

		if (data == "no token") return connectButton();

		return UI.list({ data });
	},
	actions: ({ data, loading }) => {
		// if (loading || !data || data == "no token") return [];
		if (loading || data == "no token") return [];

		return [
			{
				label: "View",
				icon: UI.icon("search"),
				handler: () => {
					openChoicePicker({
						fullScreen: true,
						// title: entity ? `Select ${entity}` : null,
						// title: entity,
						inset: false,
						dismissible: false,
						noHeading: false,
						choices: dataLoader().then((res) => {
							return res.map((item) => ({
								...item,
								value: item,
							}));
						}),
					}).then((res) => {
						if (!res) return res;
						openUrl(res.url);
					});
				},
			},
			{
				label: "Shuffle",
				icon: UI.icon("shuffle"),
				handler: ({ refetch }) => refetch?.(),
			},
		];
	},
});

const registerRandomSpotifyAction = (name, loader, { label = "" } = {}) => {
	return registerAction(name, {
		label,
		icon: appIcon,
		color: appColor,
		global: true,
		tags: ["spotify"],
		handler: async () => {
			window.openPage({
				// noHeading: true,
				type: "preview",
				resolve: async () => {
					try {
						await someTime();
						const res = await loader();
						let entry = await sourceGet(
							{
								handler: () => res,
							},
							{
								random: true,
								single: true,
							}
						);

						if (name == "randomSpotifyTrack")
							entry = await getTrackDetails(entry.url);

						return entry;
					} catch (error) {
						// @ts-ignore
						window.promptConnectSpotify(() =>
							openUrl(`crotchet://action/${name}`)
						);
					}
				},
				onReady: ({ pageData, closePage }) => {
					if (!pageData?.preview_url) return;

					closePage();

					previewTrack(pageData);
				},
			});
		},
	});
};

registerRandomSpotifyAction("randomSpotifyPlaylist", queryPlaylists, {
	label: "Random Playlist",
});

registerRandomSpotifyAction("randomSpotifyArtist", queryArtists, {
	label: "Random Artist",
});

registerRandomSpotifyAction("randomSpotifyAlbum", queryAlbums, {
	label: "Random Album",
});

registerRandomSpotifyAction("randomSpotifyTrack", queryTracks, {
	label: "Random Track",
});

registerAction("previewSpotifySong", {
	icon: appIcon,
	context: "share",
	match: ({ url }) =>
		url?.toString().startsWith("https://open.spotify.com/track/"),
	handler: async ({ url }) => openSongPreviewPage({ url }),
});

registerWidget("spotifyPlaylists", {
	icon: appIcon,
	label: "Recent Playlists",
	title: "Saved Spotify Playlists",
	listenForUpdates: [connectionChangedEvent],
	...widgetResolverContentActions(queryPlaylists, {
		entity: "Playlists",
	}),
});

registerWidget("spotifyArtists", {
	icon: appIcon,
	label: "Saved Artists",
	title: "Top Artists",
	listenForUpdates: [connectionChangedEvent],
	...widgetResolverContentActions(queryArtists, {
		entity: "Artists",
	}),
});

registerWidget("spotifyTracks", {
	icon: appIcon,
	label: "Recent Tracks",
	title: "Top Tracks",
	listenForUpdates: [connectionChangedEvent],
	...widgetResolverContentActions(queryTracks, {
		entity: "Tracks",
	}),
});

registerWidget("spotifyAlbums", {
	icon: appIcon,
	label: "Recent Albums",
	title: "Top Albums",
	listenForUpdates: [connectionChangedEvent],
	...widgetResolverContentActions(queryAlbums, {
		entity: "Albums",
	}),
});

registerWidget("randomSpotifyTrack", {
	icon: appIcon,
	label: "Random Track",
	listenForUpdates: [connectionChangedEvent],
	resolve: async () => {
		try {
			const res = await queryTracks();
			return await sourceGet(
				{
					handler: () => res,
				},
				{
					random: true,
					single: true,
				}
			);
		} catch (error) {
			console.log("Failed to fetch random track: ", error);
		}

		return "no token";
	},
	onClick: ({ data }) => (data.url ? openSongPreviewPage(data) : null),
	onSwipe: ({ refetch }) => refetch?.(),
	title: ({ data, loading }) => {
		if (loading || !data || data == "no token")
			return "Random Spotify Track";
	},
	content: ({ data, loading }) => {
		if (loading || !data) return;

		if (data == "no token") return connectButton();

		return UI.component({
			className: "size-full relative text-center",
			content: `
				<img class="absolute inset-0 size-full ssize-16 rounded-md object-cover" src="${data.image}" />
				<div class="flex-1 absolute inset-0 bg-black/50 dark:bg-black/80 text-white flex flex-col items-center justify-center pt-2 px-4">
					<h3 class="text-lg font-bold">${data.title}</h3>
					<p class="opacity-75 line-clamp-2">${data.subtitle}</p>
				</div>
			`,
		});
	},
	actionButton: ({ data, loading }) => {
		if (loading || !data || data == "no token") return null;

		return {
			icon: UI.icon("play", { filled: true }),
			label: "Play on Spotify",
			url: data.url,
		};
	},
	actions: ({ loading, data }) => {
		if (loading || !data || data == "no token") return [];

		return [];

		return [
			{
				label: "Shuffle",
				icon: UI.icon("shuffle"),
				handler: ({ refetch }) => {
					refetch?.();
				},
			},
		];
	},
});

const connectButton = () => {
	return UI.component({
		className:
			"size-full flex flex-col gap-2 items-center justify-center pb-3.5",
		content: `
			<button
				class="disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full"
				x-bind:disabled="connecting"
				x-data="{
					connecting: false,
					async connectSpotify() {
						this.connecting = true;
						await window.promptConnectSpotify();
						this.connecting = false;
					}
				}"
				@click="connectSpotify()"
			>
				<svg class="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="${appIconPath}" /></svg>
				<span>Connect Spotify</span>
			</button>
		`,
	});
};

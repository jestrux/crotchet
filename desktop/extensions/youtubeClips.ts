import "../../@types/index";

const getYoutubeId = (url) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

const getYoutubeClipUrl = (clip) =>
	`crotchet://app/youtubeClips?${objectToQueryParams(clip)}`;

const getYoutubeActualUrl = (props) => {
	const [start] = (props?.crop || [0, props?.duration]).map(Number);
	return `https://youtube.com/watch?v=${props?._id}&t=${start.toFixed(0)}`;
};

const appIcon = UI.svg(
	"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
	{
		filled: true,
	}
);

const mapEntry = (entry) => ({
	...entry,
	video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
	title: entry.name,
	subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
		?.map(toHms)
		.join(", ")} - ${toHms(entry.duration)}`,
	url: getYoutubeClipUrl(entry),
});

const openOnDesktop = (clip) =>
	socketEmit("run-action", {
		showWindow: true,
		action: "playYoutubeClip",
		scheme: "youtubeClips",
		url: getYoutubeClipUrl(clip).replace(
			"/youtubeClips/desktop/",
			"/youtubeClips"
		),
		window: {
			// maximize: true,
			// fullScreen: true,
		},
		payload: clip,
		// payload: getPlayClipPage(clip),
	});

const getActions = (payload) => {
	const actions = {
		// playVideo: {
		// 	icon: appIcon,
		// 	url: clipUrl,
		// 	section: "Play",
		// },
		...(onDesktop()
			? {}
			: {
					playOnDesktop: {
						icon: UI.icon("open-external"),
						match: () => !onDesktop(),
						handler: () => openOnDesktop(payload),
					},
			  }),
		playOnYoutube: {
			icon: appIcon,
			url: getYoutubeActualUrl(payload),
			section: "Play",
		},
		// shareVideo: {
		// 	icon: appIcon,
		// 	label: "Share",
		// 	url: `crotchet://broadcast/url/${payload.url}}`,
		// },
		...(!onDesktop()
			? {}
			: {
					editYoutubeClip: {
						icon: appIcon,
						label: "Edit Video",
						section: "Edit",
						handler: async () => {
							// return editVideo({
							// 	title: "Edit Youtube Clip",
							// 	resolve: payload,
							// 	openForm,
							// 	handler: (editedVideo) => {
							// 		if (!editedVideo) return;
							// 		return dataSources.youtubeClips.updateRow(
							// 			payload._id,
							// 			editedVideo
							// 		);
							// 	},
							// });
						},
					},
					editYoutubeClipSource: {
						icon: appIcon,
						label: "Change Source",
						section: "Edit",
						handler: () => showToast("Change Clip Source"),
						// handler: async () => {
						// 	const url = await openForm({
						// 		title: "Change Clip Source",
						// 		field: {
						// 			label: "URL",
						// 			url: "text",
						// 			defaultValue: payload.url,
						// 		},
						// 	});

						// 	if (!url) return;

						// 	const res = await getYoutubeVideoEditor(url, openPage, {
						// 		crop: payload.crop,
						// 	});

						// 	await dataSources.youtubeClips.deleteRow(payload._id);

						// 	const video = await dataSources.youtubeClips.insertRow({
						// 		...(res ?? {}),
						// 		_rowId: res.id,
						// 	});

						// 	showToast("Clip Source Updated");

						// 	return video;
						// },
					},
			  }),
		deleteYoutubeClip: {
			icon: appIcon,
			label: "Delete Video",
			destructive: true,
			handler: async () => {
				const confirmed = await confirmDangerousAction();

				if (!confirmed) return;

				try {
					await dataSources.youtubeClips.deleteRow(payload._id);
					showToast("Clip deleted");
				} catch (error) {
					showToast("Failed to delete clip");
					console.log(error);
				}
			},
		},
		...(!onDesktop()
			? {}
			: {
					addClip: {
						label: "Add Clip",
						// handler: addClip,
						handler: () => showToast("Add Clip"),
					},
			  }),
	};

	return Object.entries(actions).reduce((agg, [name, action]) => {
		return [
			...agg,
			{
				name,
				label: camelCaseToSentenceCase(name),
				...action,
			},
		];
	}, []);
};

const addClip = async ({ url }) => {
	return openPage({
		title: "Add youtube Clip",
		// resolve: () => getYoutubeVideoDetails(url),
		// handler: saveVideo,
	});
};

const createInterval = (callback, interval) => {
	let rafId = null;
	let lastTime = performance.now();

	const tick = (currentTime) => {
		if (currentTime - lastTime >= interval) {
			callback();
			lastTime = currentTime;
		}
		rafId = requestAnimationFrame(tick);
	};

	rafId = requestAnimationFrame(tick);

	return () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
			console.log("Clean looper...");
		}
	};
};

const getPlayClipPage = (clip, external) => {
	clip = mapEntry(clip);
	const formatCropTime = (time) => Number(Number(time).toFixed(3));
	const { duration } = clip;
	const videoId = clip._id || clip.id;
	const [start, end] = (clip.crop || [0, duration]).map(formatCropTime);
	const crop = [start, end];
	let cropEnabled = true;
	let player,
		inited = false;

	const restartVideo = () => {
		const [start] = crop.map(formatCropTime);
		player.seekTo(cropEnabled ? start : 0);
		player.playVideo();
	};

	const seekTo = (time) => {
		const [start, end] = crop.map(formatCropTime);
		if (time >= end || time >= duration || time <= start) time = 0;
		player.seekTo(time);
		player.playVideo();
	};

	const listenForTime = (e) => {
		console.log("On state change:", e.data);

		if (e && (e.data != 1 || inited)) return;
		inited = true;

		stopLooper = createInterval(() => {
			let lastTimeUpdate = 0;
			const time = formatCropTime(player.getCurrentTime());

			if (cropEnabled && time !== lastTimeUpdate) {
				lastTimeUpdate = time;

				const [start, end] = crop.map(formatCropTime);

				if (time >= end || time >= duration || time <= start)
					restartVideo();
			} else {
				console.log("Same time as before...");
			}
		}, 350);
	};

	let stopLooper;

	const initPlayer = () => {
		let script = document.querySelector("#youtube-player-iframe");
		const connectJS = () => {
			player = new window.YT.Player("youtube-player");
			// , {
			// 	events: {
			// 		onReady: () => {
			// 			console.log("On player ready...");
			// 			window.addEventListener("message", listenForTime);
			// 		},
			// 	},
			// });
			console.log("Player: ", player);
			player.addEventListener("onStateChange", listenForTime);
		};

		if (!script) {
			script = document.createElement("script");
			script.id = "youtube-player-iframe";
			script.src = "https://www.youtube.com/iframe_api";
			document.body.appendChild(script);
		}

		if (window.YT?.Player) connectJS();
		else window.onYouTubeIframeAPIReady = () => connectJS();
	};

	const handleAction = (e) => {
		const time = formatCropTime(player.getCurrentTime());
		const { action } = e?.detail || {};
		if (action == "restart") restartVideo();
		if (action == "skip-back") seekTo(time - 5);
		if (action == "skip-forward") seekTo(time + 5);
		if (action == "toggle-crop") {
			cropEnabled = !cropEnabled;
			restartVideo();
		}
		if (action == "open") {
			closePage();
			openUrl(getYoutubeActualUrl(clip));
		}
		if (action == "pip") {
			closePage();
			openPage(getPlayClipPage(clip, true));
		}
	};

	return {
		external,
		type: "detail",
		title: clip.title,
		fullScreen: true,
		content: () => {
			const src = `https://www.youtube.com/embed/${videoId}?&autoplay=1&enablejsapi=1&controls=0&start=${start.toFixed(
				0
			)}`;
			// const handleReady = () => {}
			return UI.component({
				content: () => `
					<div class="absolute inset-0 bg-black flex items-center justify-center">
						<iframe
							id="youtube-player"
							class="pointer-events-none size-full"
							src="${src}"
							allow="autoplay; encrypted-media"
							allowfullscreen
						></iframe>
					</div>
				`,
				onInit: ({ $el }) => {
					// const iframe = $el.querySelector("#youtube-player");
					// console.log("On init: ", iframe);
					// iframe.addEventListener("load", (...args) => {
					// 	console.log("Iframe loaded...", ...args);
					// });
					initPlayer();
					window.addEventListener(
						"youtube-clip-action",
						handleAction,
						false
					);
				},
				onRemoteAction: (action) =>
					dispatch("youtube-clip-action", { action: action.id }),
				onDestroy: () => {
					console.log("Do a clean YT clips destroy...");
					if (typeof stopLooper == "function") stopLooper();
					window.removeEventListener(
						"youtube-clip-action",
						handleAction,
						false
					);
					// if (window.YT?.Player)
					// 	window.addEventListener("message", listenForTime);
					// else console.log("No player initialized...");

					// const script = document.querySelector(
					// 	"#youtube-player-iframe"
					// );
					// if (script) script.remove();
					// if (window.YT) delete window.YT;
				},
			});
		},
		// preview: () =>
		// 	UI.component({
		// 		content: `
		// 			<div class="absolute inset-0 bg-black flex items-center justify-center">
		// 				<img class="max-w-full max-h-full" src="${clip.video}" />
		// 			</div>
		// 		`,
		// 	}),
		action: (ctx) => ({
			label: "Restart",
			id: "restart",
			handler: () =>
				dispatch("youtube-clip-action", { ctx, action: "restart" }),
		}),
		actions: (ctx) => [
			{
				id: "pip",
				remote: true,
				label: "Picture in Picture",
				shortLabel: "Pip",
				shortcut: "Shift + Option + P",
				handler: () =>
					dispatch("youtube-clip-action", { ctx, action: "pip" }),
			},
			{
				id: "restart",
				remote: true,
				label: "Restart",
				shortcut: "Option + R",
				handler: () =>
					dispatch("youtube-clip-action", { ctx, action: "restart" }),
			},
			{
				id: "toggle-crop",
				remote: true,
				shortLabel: "Crop",
				label: "Toggle Crop",
				shortcut: "Shift + Option + C",
				handler: () =>
					dispatch("youtube-clip-action", {
						ctx,
						action: "toggle-crop",
					}),
			},
			{
				id: "skip-back",
				remote: true,
				section: "Skip",
				label: "Skip Back",
				shortLabel: "Back",
				shortcut: "Option + ArrowLeft",
				handler: () =>
					dispatch("youtube-clip-action", {
						ctx,
						action: "skip-back",
					}),
			},
			{
				id: "skip-forward",
				remote: true,
				section: "Skip",
				label: "Skip Forward",
				shortLabel: "Forward",
				shortcut: "Option + ArrowRight",
				handler: () =>
					dispatch("youtube-clip-action", {
						ctx,
						action: "skip-forward",
					}),
			},
			{
				id: "open",
				remote: true,
				section: "Open",
				label: "On Youtube",
				shortcut: "Option + Y",
				handler: () =>
					dispatch("youtube-clip-action", {
						ctx,
						action: "open",
					}),
			},
		],
	};
};

const playClip = async (clip) => openPage(getPlayClipPage(clip));

registerDataSource("db", "youtubeClips", {
	table: "youtubeClips",
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	mapEntry,
	searchFields: ["title"],
	layoutProps: {
		layout: "grid",
		aspectRatio: "16/9",
		columns: "sm:2,2xl:3,4xl:4",
	},
	actions: [
		{
			label: "Random Clip",
			handler: async () => openUrl("crotchet://action/randomYoutubeClip"),
			section: "Play",
		},
		{
			label: "Latest Clip",
			handler: async () =>
				playClip(await withLoader(dataSources.youtubeClips.latest())),
			section: "Play",
		},
		{
			label: "Add Clip",
			handler: addClip,
		},
	],
	entryActions: getActions,
	entryAction: (entry) => ({
		label: "Play Video",
		// url: entry.url,
		handler: () => playClip(entry),
	}),
});

registerWidget("randomYoutubeClip", {
	listenForUpdates: "refetch-random-youtube-clip-widget",
	onSwipe: ({ refetch }) => refetch(),
	resolve: async () => {
		let entry = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "_index,desc", single: true, random: true }
		);

		if (entry) entry = mapEntry(entry);

		const getYoutubeUrl = (payload) => {
			const { _id, crop, duration } = payload || {};
			const [start] = (crop || [0, duration]).map(Number);
			return `https://youtube.com/watch?v=${_id}&t=${start.toFixed(0)}`;
		};

		return {
			...entry,
			video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
			title: entry.name,
			subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
				?.map(toHms)
				.join(", ")} - ${toHms(entry.duration)}`,
			url: getYoutubeUrl(entry),
			// actions: getActions(entry),
			actions: [
				{
					label: "Shuffle",
					icon: UI.icon("shuffle"),
					handler: () =>
						dispatch("refetch-random-youtube-clip-widget"),
				},
				{
					label: "Play On Desktop",
					icon: UI.icon("open-external"),
					handler: () => {
						console.log("Widget entry: ", entry);
						return openOnDesktop(entry);
					},
				},
				{
					label: "Play On Youtube",
					icon: appIcon,
					url: getYoutubeActualUrl(entry),
					section: "Play",
				},
			],
		};
	},
	content: UI.media,
});

const formatVideo = (entry) => ({
	...entry,
	video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
	title: entry.name,
	subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
		?.map(toHms)
		.join(", ")} - ${toHms(entry.duration)}`,
	url: getYoutubeActualUrl(entry),
	actions: getActions(entry),
});

// registerWidget("youtubeClips", {
// 	title: "Youtube Clips",
// 	resolve: async ({ state }) => {
// 		const res = await sourceGet(
// 			{ handler: () => queryDb("youtubeClips") },
// 			{ orderBy: "updatedAt,desc", random: state.random, limit: 3 }
// 		);
// 		return res?.map((entry) => ({
// 			...entry,
// 			video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
// 			title: entry.name,
// 			subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
// 				?.map(toHms)
// 				.join(", ")} - ${toHms(entry.duration)}`,
// 			url: getYoutubeActualUrl(entry),
// 			actions: getActions(entry),
// 		}));
// 	},
// 	content: UI.list,
// 	actions: [
// 		{
// 			label: "Shuffle",
// 			icon: UI.icon("shuffle"),
// 			handler: ({ refetch, setState }) => {
// 				setState("random", true);
// 				refetch();
// 			},
// 		},
// 		{ label: "Add Clip", icon: UI.icon("add"), handler: () => {} },
// 	],
// 	listenForUpdates: "firebase-table-updated:youtubeClips",
// });

registerSection("recentYoutubeClips", {
	title: "Recent Clips",
	type: "grid",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "updatedAt,desc", random: state.random, limit: 2 }
		);
		return res?.map(formatVideo);
	},
	meta: {
		limit: 2,
	},
});

registerAction("playYoutubeClip", playClip);

registerAction("addToYoutubeClips", {
	label: "Add to Youtube Clips",
	context: "share",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: addClip,
});

registerAction("randomYoutubeClip", {
	label: "Random Clip",
	icon: appIcon,
	global: true,
	context: "shortcut",
	tags: ["youtube"],
	handler: async () => {
		if (onDesktop()) {
			try {
				const res = await withLoader(
					sourceGet(
						{ handler: () => queryDb("youtubeClips") },
						{
							orderBy: "updatedAt,desc",
							random: true,
							single: true,
						}
					)
				);

				if (!res) return showToast("Failed to get clip");

				return playClip(res);
			} catch (error) {
				showToast("Failed to get clip");
			}
		}
		window.openActionSheet({
			noHeading: true,
			actions: async () => {
				try {
					const res = await sourceGet(
						{ handler: () => queryDb("youtubeClips") },
						{
							orderBy: "updatedAt,desc",
							random: true,
							single: true,
						}
					);

					if (!res) return showToast("Failed to get clip");

					// copyToClipboard(
					// 	random(res).urls.regular.replace("w=1080", "w=600")
					// );

					const entry = formatVideo(res);

					window.openActionSheet({
						preview: _.pick(entry, [
							"image",
							"video",
							"title",
							"subtitle",
						]),
						actions: [
							{
								label: "Play On Desktop",
								icon: UI.icon("open-external"),
								handler: () => openOnDesktop(entry),
							},
							{
								label: "Play On Youtube",
								icon: appIcon,
								url: getYoutubeActualUrl(entry),
							},
						],
					});
				} catch (error) {
					showToast("Failed to get clip");
				}
			},
		});
	},
});

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
	// url: getYoutubeClipUrl(entry),
	url: getYoutubeActualUrl(entry),
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
			? {
					playPictureinPicture: {
						shortcut: "Shift + Option + P",
						label: "Play PIP",
						icon: UI.svg(
							"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
							{ size: "18px", filled: true }
						),
						handler: () =>
							openOnDesktop({
								...payload,
								external: true,
							}),
					},
			  }
			: {
					playOnDesktop: {
						icon: UI.icon("open-external"),
						match: () => !onDesktop(),
						handler: () => openOnDesktop(payload),
					},
					playPipOnDesktop: {
						label: "Play PIP On Desktop",
						icon: UI.svg(
							"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
							{ size: "18px", filled: true }
						),
						handler: () =>
							openOnDesktop({
								...payload,
								external: true,
							}),
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

const getPlayClipPage = (clip, external = false) => {
	clip = mapEntry(clip);
	const formatCropTime = (time) => Number(Number(time).toFixed(3));
	const { duration } = clip;
	const [start, end] = (clip.crop || [0, duration]).map(formatCropTime);
	// const src = `https://www.youtube.com/embed/${
	const src = `https://www.youtube-nocookie.com/embed/${
		clip._id || clip.id
	}?&autoplay=1&enablejsapi=1&controls=0&start=${start.toFixed(0)}`;
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
		if (action == "youtube") {
			closePage();
			openUrl(getYoutubeActualUrl(clip));
		}
		if (action == "pip") {
			closePage();
			openPage(getPlayClipPage(clip, true));
		}
	};

	const componentProps = {
		content: () => `
			<div class="absolute inset-0 bg-black flex items-center justify-center"
				x-data="{
					cropEnabled: true,
					lastTimeUpdate: 0,
					player: null,
					videoId: '${clip._id || clip.id}',
					start: ${start},
					end: ${end},
					duration: ${duration},
					get crop () {
						return [this.start, this.end].map(this.formatCropTime)
					},
					get src () {
						return [
							'https://www.youtube-nocookie.com/embed/',
							this.videoId,
							'?autoplay=1&enablejsapi=1&controls=0&start=',
							this.start.toFixed(0),
						].join('')
					},
					get youtubeUrl () {
						return [
							'https://youtube.com/watch?v=',
							this.videoId,
							'&t=',
							this.crop[0].toFixed(0),
						].join('')
					},
					handleRemoteAction(payload) {
						console.log('Remote action in: ', payload);
						const action = payload.id;
						if (action == 'restart') this.restartVideo();
						if (action == 'skip-back') this.seekTo(this.currentTime - 5);
						if (action == 'skip-forward') this.seekTo(this.currentTime + 5);
						if (action == 'toggle-crop') {
							this.cropEnabled = !this.cropEnabled;
							this.restartVideo();
						}
						if (action == 'restore') {
							window.closeFloatingWindow(this.$page._id);
							window.socketEmit('run-action', {
								showWindow: true,
								action: 'playYoutubeClip',
								payload: this.videoId,
							});
						}
						if (action == 'youtube') {
							window.closeFloatingWindow(this.$page._id);
							window.socketEmit('open', this.youtubeUrl);
						}
					},
					init() {
						console.log('Page:', this.$page);
						this.$onRemoteAction((payload) => this.handleRemoteAction(payload));
						if(!window.YT?.Player) {
							this.loadPlayer();
							return console.log('Player not loaded!!!');
						}
						this.initPlayer();
					},
					loadPlayer() {
						window.onYouTubeIframeAPIReady = () => {
							console.log('Iframe ready...');
							this.initPlayer();
						};
					},
					initPlayer() {
						console.log('Init youtube player', window.YT.Player);
						this.player = new window.YT.Player('youtube-player', {
							events: {
								onReady: () => {
									console.log('On player ready...');
									window.addEventListener('message', (e) => this.listenForTime(e));
								},
							},
						});
					},
					formatCropTime(time) {
						return Number(Number(time).toFixed(3))
					},
					restartVideo(){
						const [start] = this.crop;
						this.seekTo(this.cropEnabled ? start : 0, true);
					},
					seekTo(time, skipCheck){
						if(!skipCheck) {
							const [start, end] = this.crop;
							if (time >= end || time >= this.duration || time <= start) time = 0;
						}
						this.currentTime = time;
						this.player.seekTo(time);
						this.player.playVideo();
					},
					listenForTime(event){
						this.lastTimeUpdate = 0;

						const data = JSON.parse(event.data);

						if (
							data.event === 'infoDelivery' &&
							data.info &&
							data.info.currentTime
						) {
							const time = this.formatCropTime(data.info.currentTime);
							this.currentTime = time;

							if (time == this.lastTimeUpdate) return;

							this.lastTimeUpdate = time;

							let [start, end] = this.crop;

							if(!this.cropEnabled) {
								start = 0;
								end = this.duration;
							}

							if (time < end && time > start) return;

							this.restartVideo();
						}
					}
				}"
			>
				<iframe
					id="youtube-player"
					class="pointer-events-none size-full"
					src="${src}"
					x-bind:src="src"
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
			window.addEventListener("youtube-clip-action", handleAction, false);
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
	};

	const actions = (ctx, external = false) => [
		{
			id: "restart",
			icon: UI.svg(
				"M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z",
				{ size: "18px", filled: true }
			),
			remote: true,
			label: "Restart",
			shortcut: "Option + R",
			handler: () =>
				dispatch("youtube-clip-action", { ctx, action: "restart" }),
		},
		{
			id: "skip-back",
			icon: UI.svg("M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z", {
				size: "18px",
				filled: true,
			}),
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
			icon: UI.svg("M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z", {
				size: "18px",
				filled: true,
			}),
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
			id: "toggle-crop",
			icon: UI.svg(
				"M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z",
				{ size: "18px", filled: true }
			),
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
		...(external
			? [
					{
						id: "restore",
						icon: UI.svg(
							"M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z",
							{ size: "18px", filled: true }
						),
						remote: true,
						label: "Restore",
					},
			  ]
			: [
					{
						id: "pip",
						icon: UI.svg(
							"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
							{ size: "18px", filled: true }
						),
						remote: true,
						label: "Picture in Picture",
						shortLabel: "Pip",
						shortcut: "Shift + Option + P",
						handler: () =>
							dispatch("youtube-clip-action", {
								ctx,
								action: "pip",
							}),
					},
			  ]),
		{
			id: "youtube",
			icon: UI.svg(
				"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
				{
					size: "18px",
					filled: true,
				}
			),
			remote: true,
			section: "Open",
			label: "On Youtube",
			shortcut: "Option + Y",
			handler: () =>
				dispatch("youtube-clip-action", {
					ctx,
					action: "youtube",
				}),
		},
	];

	if (external) {
		return {
			external: true,
			id: "floatingYoutubeClip",
			image: clip.poster,
			video: clip.video,
			title: clip.title,
			...componentProps,
			actions: actions({}, true),
			window: {
				background: "black",
				// frame: false,
				width: 500,
				height: 280,
			},
			externalAssets: [
				{
					type: "script",
					name: "youtubeIframeApi",
					url: "https://www.youtube.com/iframe_api",
				},
			],
			onEvent: (event) => {
				if (event == "ready")
					openRemotePageController("floatingYoutubeClip");
			},
		};
	}

	return {
		id: "youtubeClipDetail",
		type: "detail",
		image: clip.poster,
		video: clip.video,
		title: clip.title,
		fullScreen: true,
		content: () => UI.component(componentProps),
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
		actions,
	};
};

const getRandomClip = async () => {
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

		if (!res) {
			showToast("Failed to get clip");
			return null;
		}

		return res;
	} catch (error) {
		showToast("Failed to get clip");
	}
};

const playClip = async (clip, external = false) => {
	if (typeof clip == "string") {
		const pageRes = await withLoader(
			queryDb("youtubeClips", {
				rowId: clip,
			})
		);

		console.log("Clip: ", clip, pageRes);

		if (!pageRes._id) return;

		clip = pageRes;
	}

	openPage(getPlayClipPage(clip, external || clip?.external));
};

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
					label: "Play PIP On Desktop",
					icon: UI.svg(
						"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
						{ size: "18px", filled: true }
					),
					handler: () => {
						console.log("Widget entry: ", entry);
						return openOnDesktop({ ...entry, external: true });
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
	actions: [],
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

registerWidget("youtubeClips", {
	title: "Youtube Clips",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "updatedAt,desc", random: true, limit: 3 }
			// { orderBy: "updatedAt,desc", random: state.random, limit: 3 }
		);
		return res?.map((entry) => ({
			...entry,
			...mapEntry(entry),
		}));
	},
	content: UI.list,
	actions: [
		{
			label: "Search",
			icon: UI.icon("search"),
			handler: () => {
				openChoicePicker({
					// title: "Youtube Clips",
					layout: "grid",
					fullScreen: true,
					inset: false,
					dismissible: false,
					noHeading: false,
					choices: async () => {
						const res = await sourceGet(
							{ handler: () => queryDb("youtubeClips") },
							{ orderBy: "name" }
						);

						return res.map((item) => ({
							...mapEntry(item),
							label: item.title,
							value: item,
							url: getYoutubeActualUrl(item),
						}));
					},
				}).then((res) => {
					if (!res) return res;
					openUrl(res.url);
				});
			},
		},
		{
			label: "Shuffle",
			icon: UI.icon("shuffle"),
			handler: ({ refetch, setState }) => {
				setState("random", true);
				refetch();
			},
		},
		// { label: "Add Clip", icon: UI.icon("add"), handler: () => {} },
	],
	listenForUpdates: "firebase-table-updated:youtubeClips",
});

registerSection("recentYoutubeClips", {
	title: "Recent Clips",
	type: "grid",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "updatedAt,desc", random: state.random, limit: 4 }
		);
		return res?.map(formatVideo);
	},
	meta: {
		limit: 4,
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
	color: "#FF0032",
	global: true,
	context: "shortcut",
	tags: ["youtube"],
	actions: () =>
		!onDesktop()
			? []
			: [
					{
						id: "pip",
						label: "Picture in Picture",
						shortLabel: "Pip",
						shortcut: "Shift + Option + P",
						handler: async () => {
							const clip = await getRandomClip();
							if (clip) playClip(clip, true);
						},
					},
			  ],
	handler: async () => {
		if (onDesktop()) {
			const clip = await getRandomClip();
			if (clip) playClip(clip);
			return;
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
						fullScreen: true,
						preview: _.pick(entry, [
							"url",
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
								label: "Play PIP On Desktop",
								icon: UI.svg(
									"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
									{ size: "18px", filled: true }
								),
								handler: () => {
									console.log("Widget entry: ", entry);
									return openOnDesktop({
										...entry,
										external: true,
									});
								},
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

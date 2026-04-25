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
	const [start, end] = (props?.crop || [0, props?.duration]).map(Number);
	return `https://youtube.com/watch?v=${props?._id}&t=${start.toFixed(
		0
	)}s&loop=0&${start ? `start=${toHms(start)}&` : ""}${
		end ? `end=${toHms(end)}` : ""
	}`;
};

const getEmbedUrl = (url, start = 0, end = 0) =>
	`https://www.youtube-nocookie.com/embed/${getYoutubeId(url)}${
		start ? `?start=${start}&` : ""
	}${end ? `end=${end}` : ""}`;

const getPoster = (url) =>
	`https://i.ytimg.com/vi/${getYoutubeId(url)}/hqdefault.jpg`;

const formFields = [
	"title",
	"poster",
	"start",
	"end",
	"duration",
	"crop",
	"description",
	"url",
];

const appIcon = UI.svg(
	"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
	{
		filled: true,
	}
);

const mapEntry = (entry) => ({
	...entry,
	video: getPoster(getYoutubeActualUrl(entry)),
	title: entry.name || entry.title,
	subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
		?.map(toHms)
		.join(", ")} - ${toHms(entry.duration)}`,
	// url: getYoutubeClipUrl(entry),
	// url: getYoutubeActualUrl(entry),
	url: `crotchet://action/playYoutubeClip?arg=${entry._id || entry.id}`,
	actions: getActions(entry),
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
		payload: _.omit(clip, ['action', 'actions']),
		// payload: getPlayClipPage(clip),
	});

// const openOnDesktop = (clip) =>
// 	socketEmit(
// 		"open-url",
// 		`crotchet://action/playYoutubeClip?arg=${clip._id || clip.id}`
// 	);

const getActions = (payload) => {
	const actions = {
		// playVideo: {
		// 	icon: appIcon,
		// 	url: `crotchet://action/playYoutubeClip?${objectToQueryParams(
		// 		payload
		// 	)}`,
		// 	section: "Play",
		// },
		playOnYoutube: {
			icon: appIcon,
			url: getYoutubeActualUrl(payload),
			section: "Play",
			pinned: true,
		},
		...(onDesktop()
			? {
					playPictureinPicture: {
						shortcut: "Shift + Option + P",
						label: "Play PIP",
						icon: UI.svg(
							"M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
							{ size: "18px", filled: true }
						),
						pinned: true,
						section: "Play",
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
						pinned: false,
						handler: async () => {
							return editVideo({
								title: "Edit Youtube Clip",
								resolve: async () => payload,
								handler: (editedVideo) => {
									if (!editedVideo) return;
									return dataSources.youtubeClips.updateRow(
										payload._id,
										_.pick(editedVideo, formFields)
									);
								},
							});
						},
					},
					editYoutubeClipSource: {
						icon: appIcon,
						label: "Change Source",
						section: "Edit",
						pinned: false,
						// handler: () => showToast("Change Clip Source"),
						handler: async () => {
							const url = await openForm({
								title: "Change Clip Source",
								field: {
									label: "URL",
									url: "text",
									defaultValue: await readClipboard().then(
										({ value } = {}) =>
											getYoutubeId(value) ? value : ""
									),
								},
							});

							if (!url) return;

							console.log("URL: ", url);

							return editVideo({
								title: "Change Clip Source",
								resolve: async () => getVideoDetails(url),
								handler: async (res) => {
									if (!res) return;

									await dataSources.youtubeClips.deleteRow(
										payload._id
									);

									const video =
										await dataSources.youtubeClips.insertRow(
											{
												...(res ?? {}),
												_rowId: res._id,
											}
										);

									showToast("Clip Source Updated");

									return video;
								},
							});
						},
					},
			  }),
		deleteYoutubeClip: {
			icon: UI.icon("delete"),
			label: "Delete Video",
			pinned: false,
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
						pinned: false,
						section: "Add",
						handler: () => addClip(),
						// handler: () => showToast("Add Clip"),
					},
			  }),
	};

	// @ts-ignore
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

// const addClip = async ({ url }) => {
// 	return openPage({
// 		title: "Add youtube Clip",
// 		// resolve: () => getYoutubeVideoDetails(url),
// 		// handler: saveVideo,
// 	});
// };

const editVideo = async ({ title, resolve, handler }) => {
	return openForm({
		title: title
			? title
			: ({ pageData: video }) =>
					`${video?._rowId ? "Edit" : "Add"} Youtube Clip`,
		resolve: async () => {
			// const payload =
			// 	typeof resolve == "function" ? await resolve() : resolve;
			let payload = await resolve();

			const formatPayload = (payload) => {
				const start = payload.crop?.at(0) || 0;
				const end = payload.crop?.at(1) || payload.duration;

				return {
					...payload,
					title: payload.title || payload.name,
					start,
					end,
					crop: [start, end],
				};
			};

			if (!payload.title || !payload.duration) {
				const meta = await UI.youtubePlayer.loadVideo(payload._id);
				payload = { ...payload, ...meta };
			}

			return formatPayload(payload);
		},
		preview({ pageData: video }) {
			if (!video) return null;
			return UI.youtubePlayer(video, { showMeta: true });
		},
		fields: {
			title: "text",
			poster: "image",
			start: "text",
			end: "text",
			duration: "text",
		},
		action: {
			label: "Save Clip",
			// loadingMessage: "Saving Clip...",
			// successMessage: "Clip Saved",
			handler: (res) => {
				if (!res) return null;

				const { start, end, ...video } = res;

				const payload = {
					...(video ?? {}),
					name: video.title,
					crop: [start, end],
				};

				if (typeof handler == "function") return handler(payload);

				return payload;
			},
		},
	});
};

const getVideoDetails = async (url) => {
	try {
		const existingClip = await queryDb("youtubeClips", {
			rowId: getYoutubeId(url),
		});

		if (existingClip) return existingClip;

		const res = await crawlUrl(
			getEmbedUrl(url).replace("youtube-nocookie", "youtube")
		);
		console.log("Res: ", res.meta);
		const data = res.data;
		const indexOfTitle = data.indexOf("videoTitle");
		const titleObject = data.substring(indexOfTitle, indexOfTitle + 320);
		const titleEnd = titleObject.indexOf("}},");
		let title = titleObject
			.substring(0, titleEnd)
			.replace("videoTitle", "")
			.replace(/\\|"|:/g, "");

		const indexOfDuration = data.indexOf("videoDurationSeconds");
		const object = data.substring(indexOfDuration, indexOfDuration + 120);
		const end = object.indexOf(",");
		let duration = object
			.substring(0, end)
			.replace("videoDurationSeconds", "")
			.replace(/\\|"|:/g, "");

		// console.log("Duration: ", indexOfDuration, duration);

		if (isNaN(Number(duration))) return null;

		let start = 0;
		const params = new URLSearchParams(url);
		const startParam = (params.get("t") || params.get("start") || "")
			.toString()
			.trim()
			.replace("s", "");
		if (startParam && !isNaN(Number(startParam)))
			start = Number(startParam);

		duration = Number(duration);

		res.meta = res.meta || {};
		const poster = getPoster(url);

		const payload = {
			...res.meta,
			_id: getYoutubeId(url),
			title,
			image: poster,
			poster,
			url,
			duration,
			start,
			end: duration,
			crop: [start, duration],
		};

		return payload;
	} catch (error) {
		console.log("Load video details error: ", error);
	}
};

const addClip = async ({ url = "" } = {}) => {
	const saveVideo = (video) => {
		var id = video?.rowId || video?._id || video.id;

		if (!id) return;

		if (video._rowId)
			return dataSources.youtubeClips.updateRow(
				video._rowId,
				_.pick(video, formFields)
			);

		return dataSources.youtubeClips.insertRow({
			...video,
			_rowId: id,
		});
	};

	url =
		url ||
		(await openForm({
			title: "Add Youtube Clip",
			field: {
				label: "Video URL",
				defaultValue: await readClipboard().then(({ value } = {}) =>
					getYoutubeId(value) ? value : ""
				),
			},
			action: {
				handler: async (url) => {
					if (!url?.length) throw "Video URL is required";

					const videoId = getYoutubeId(url);
					if (!videoId) throw `${url} is not a vaild Youtube URL`;

					return getYoutubeActualUrl({
						_id: videoId,
					});
				},
			},
		}));

	if (!url || !getYoutubeId(url)) return;
	// url = getYoutubeActualUrl({ _id: getYoutubeId(url) });

	return editVideo({
		title: "Add Youtube Clip",
		// resolve: async () => await getYoutubeVideoDetails(url),
		resolve: async () => await getVideoDetails(url),
		handler: saveVideo,
	});
};

const getPlayClipPage = (clip, external = false) => {
	clip = mapEntry(clip);
	const { duration } = clip;
	const [start, end] = (clip.crop || [0, duration]).map(Number);
	const youtubeUrl = getYoutubeActualUrl(clip);

	const onNavigate = (action) => {
		if (action === "pip") {
			closePage();
			// @ts-ignore
			openPage(getPlayClipPage(clip, true));
		}
		if (action === "youtube") openUrl(getYoutubeActualUrl(clip));
	};

	const content = () => UI.youtubePlayer(clip, { fullscreen: true, onNavigate });

	const resolve = () => ({ ...clip, start, end, crop: [start, end] });

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
			url: youtubeUrl,
			data: { start, end },
			actions: actions({}, true),
			window: {
				background: "black",
				width: 500,
				height: 280,
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
		resolve,
		content,
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
			sourceGet("youtubeClips", {
				orderBy: "updatedAt,desc",
				random: true,
				single: true,
			})
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

	// @ts-ignore
	openPage(getPlayClipPage(clip, external || clip?.external));
};

registerDataSource("db", "youtubeClips", {
	icon: appIcon,
	table: "youtubeClips",
	label: "Youtube Clips",
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
		handler: () => playClip(entry),
	}),
});

registerWidget("randomYoutubeClip", {
	icon: appIcon,
	label: "Random Clip",
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
			title: entry.name || entry.title,
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
	title: entry.name || entry.title,
	subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
		?.map(toHms)
		.join(", ")} - ${toHms(entry.duration)}`,
	url: getYoutubeActualUrl(entry),
	actions: getActions(entry),
});

registerWidget("youtubeClips", {
	icon: appIcon,
	title: "Youtube Clips",
	label: "Recent Clips",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			"youtubeClips",
			// { handler: () => queryDb("youtubeClips") },
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
			url: "crotchet://search/youtubeClips",
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

registerAction("searchYoutubeClips", {
	icon: appIcon,
	label: "Search Youtube Clips",
	context: "search",
	source: "youtubeClips",
});

registerAction("addToYoutubeClips", {
	icon: appIcon,
	label: "Add to Youtube Clips",
	context: "share",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: addClip,
	preview: (url) => {
		return UI.component({
			content: `
				<iframe src="${getEmbedUrl(url)}" class="w-full aspect-[16/9]">
				</iframe>
			`,
		});
	},
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

		return window.openPage({
			type: "preview",
			resolve: getRandomClip,
			actions: ({ pageData: entry, pageResolving }) =>
				!entry?._id || pageResolving
					? []
					: [
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
								handler: () =>
									openOnDesktop({
										...entry,
										external: true,
									}),
							},
							{
								label: "Play On Youtube",
								icon: appIcon,
								url: getYoutubeActualUrl(entry),
							},
					  ],
		});

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

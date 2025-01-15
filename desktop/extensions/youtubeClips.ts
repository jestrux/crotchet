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

const openOnDesktop = (path) => {
	socketEmit("app", {
		scheme: "youtubeClips",
		url: path.replace("/youtubeClips/desktop/", "/youtubeClips"),
		window: {
			// maximize: true,
			// fullScreen: true,
		},
	});
};

const getActions = (payload) => {
	const clipUrl = getYoutubeClipUrl(payload);
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
						match: (_, { onDesktop }) => !onDesktop(),
						handler: () => openOnDesktop(clipUrl),
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
						handler: async (_, { dataSources, openForm }) => {
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
						// handler: async (_, { dataSources, openForm, openPage }) => {
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
			handler: async (
				_,
				{ dataSources, showToast, confirmDangerousAction }
			) => {
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

registerDataSource("db", "youtubeClips", {
	table: "youtubeClips",
	label: "Youtube Clips",
	collection: "videos",
	orderBy: "updatedAt,desc",
	mapEntry: (entry) => ({
		...entry,
		video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
		title: entry.name,
		subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
			?.map(toHms)
			.join(", ")} - ${toHms(entry.duration)}`,
		url: getYoutubeClipUrl(entry),
	}),
	searchFields: ["title"],
	layoutProps: {
		layout: "grid",
		aspectRatio: "16/9",
		columns: "sm:2,2xl:3,4xl:4",
	},
	actions: [
		{
			label: "Random Clip",
			handler: async (_, { dataSources, openUrl }) =>
				openUrl(
					getYoutubeClipUrl(await dataSources.youtubeClips.random())
				),
			section: "Play",
		},
		{
			label: "Latest Clip",
			handler: async (_, { dataSources, openUrl }) =>
				openUrl(
					getYoutubeClipUrl(await dataSources.youtubeClips.latest())
				),
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
		url: entry.url,
	}),
});

registerWidget("randomYoutubeClip", {
	listenForUpdates: "refetch-random-youtube-clip-widget",
	onSwipe: ({ refetch }) => refetch(),
	resolve: async () => {
		const entry = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "_index,desc", single: true, random: true }
		);

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
					handler: () => openOnDesktop(getYoutubeClipUrl(entry)),
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

registerAction("addToYoutubeClips", {
	label: "Add to Youtube Clips",
	context: "share",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: addClip,
});

registerAction("randomClip", {
	icon: appIcon,
	global: true,
	context: "shortcut",
	tags: ["youtube"],
	handler: async () => {
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
								handler: () =>
									openOnDesktop(getYoutubeClipUrl(entry)),
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

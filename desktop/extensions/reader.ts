import "../../@types/index";

const filters = {
	watch: "📺 Watch",
	learn: "🧪 Learn",
	listen: "🎧 Listen",
	general: "🌎 General",
};

const appIcon = UI.svg(
	"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z",
	{
		filled: true,
	}
);

const formatEntry = (item) => {
	const isVideo =
		item.url?.toLowerCase().indexOf("videos") != -1 ||
		item.url?.toLowerCase().indexOf("youtube") != -1 ||
		item.group?.toLowerCase().indexOf("watch") != -1;

	return {
		...item,
		...(isVideo
			? { video: item.image || "placeholder" }
			: { image: item.image || "placeholder" }),
		title: item.title || "Untitled" + (" " + item.group),
		subtitle: item.description,
		tags: [item.group],
	};
};

registerAction("addToReadingList", {
	label: "Add to reading list",
	context: "share",
	match: ({ url }) => url?.toString().length,
	handler: async (payload) => {
		showAlert(`${JSON.stringify(payload)} - reading list!!!`);
		// return withLoader(async () => {
		// 	// successMessage,
		// 	// errorMessage,
		// 	await someTime(200);
		// 	setTimeout(() => {
		// 		alert(`${JSON.stringify(payload)} Added to reading list!!!`);
		// 	}, 300);
		// });
	},
});

// registerWidget("readingList", {
// 	title: "Learning List",
// 	listenForUpdates: "firebase-table-updated:readingList",
// 	resolve: async ({ state }) => {
// 		const res = await sourceGet(
// 			{ handler: () => queryDb("reader") },
// 			{
// 				orderBy: "_index,desc",
// 				random: state.random,
// 				filters: { group: "🧪 Learn" },
// 				limit: 5,
// 			}
// 		);
// 		return res?.map(formatEntry);
// 	},
// 	filter: () => {
// 		return {
// 			field: "group",
// 			choices: [
// 				{ label: "All", value: "" },
// 				"📺 Watch",
// 				"🧪 Learn",
// 				"🎧 Listen",
// 				"🌎 General",
// 			],
// 			defaultValue: "",
// 		};
// 	},
// 	content: UI.list,
// 	actions: [
// 		{
// 			label: "Shuffle",
// 			icon: UI.icon("shuffle"),
// 			handler: ({ refetch, setState }) => {
// 				setState?.("random", true);
// 				refetch?.();
// 			},
// 		},
// 		// actions: [{ label: "Add Entry", icon: UI.icon("add"), handler: () => {} }],
// 	],
// });

registerSection("watchList", {
	title: "Watchlist",
	type: "list",
	listenForUpdates: "firebase-table-updated:watchList",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{
				orderBy: "_index,desc",
				random: state?.random ?? true,
				filters: { group: filters.watch },
				limit: 4,
			}
		);
		return res?.map(formatEntry);
	},
});

registerSection("readingList", {
	title: "Reading List",
	type: "list",
	listenForUpdates: "firebase-table-updated:readingList",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{
				orderBy: "_index,desc",
				random: state?.random ?? true,
				filters: { group: filters.learn },
				limit: 4,
			}
		);
		return res?.map(formatEntry);
	},
});

registerAction("learnNow", {
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
						{ handler: () => queryDb("reader") },
						{
							orderBy: "_index,desc",
							filters: { group: filters.learn },
							random: true,
							single: true,
						}
					);

					const entry = formatEntry(res);

					window.openActionSheet({
						preview: _.pick(entry, [
							"image",
							"video",
							"title",
							"subtitle",
						]),
						actions: [
							{
								label: "Open",
								// icon: UI.icon("open-external"),
								icon: UI.svg(
									"M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
								),
								// url: entry.url,
								handler: () => openUrl(entry.url),
							},
							{
								label: "Open on desktop",
								icon: UI.icon("open-external"),
								// icon: appIcon,
								// url: `crotchet://app/youtubeClips?${entry.url}`,
								// url: `crotchet://socket/run?command=open ${entry.url}`,
								// url: `crotchet://socket/open/${entry.url}`,
								handler: () => socketEmit("open", entry.url),
							},
						],
					});
				} catch (error) {
					showToast("Failed to get item");
				}
			},
		});
	},
});

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

const formFields = {
	group: {
		type: "radio",
		choices: ["📺 Watch", "🧪 Learn", "🎧 Listen", "🌎 General"],
		defaultValue: "🌎 General",
	},
	image: "image",
	title: "text",
	description: "text",
	url: "text",
};

const addItem = async (item) =>
	window.openForm({
		title: "Add to reading list",
		data: item
			? {
					// group: (await Preferences.get({ key: "groupFilter" })).value ?? "",
					group: item.group || "🌎 General",
					image: item.image,
					title: item.title,
					description: item.description || item.subtitle,
					url: item.url,
			  }
			: null,
		fields: formFields,
		action: {
			label: "Save",
			handler: (data) =>
				window.withLoader(
					window.dataSources.reader.insertRow(data),
					"Added to reading list"
				),
		},
	});

registerAction("addToReadingList", {
	context: "share",
	icon: appIcon,
	match: "url",
	handler: async ({ preview, url }) =>
		addItem({
			...(preview?.image ? preview : await crawlUrl(url)),
			url,
			group: "🧪 Learn",
		}),
});

// registerAction("addToWatchList", {
// 	context: "share",
// 	icon: appIcon,
// 	match: "url",
// 	handler: async ({ preview, url }) =>
// 		addItem(
// 			{
// 				...(preview?.image ? preview : await window.crawlUrl(url)),
// 				url,
// 				group: "📺 Watch",
// 			},
// 			window
// 		),
// });

registerWidget("readingList", {
	icon: appIcon,
	title: "Learning List",
	listenForUpdates: "firebase-table-updated:readingList",
	resolve: async ({ state }) => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{
				orderBy: "_index,desc",
				random: state.random,
				filters: { group: "🧪 Learn" },
				limit: 5,
			}
		);
		return res?.map(formatEntry);
	},
	filter: () => {
		return {
			field: "group",
			choices: [
				{ label: "All", value: "" },
				"📺 Watch",
				"🧪 Learn",
				"🎧 Listen",
				"🌎 General",
			],
			defaultValue: "",
		};
	},
	content: UI.list,
	actions: [
		{
			label: "Search",
			icon: UI.icon("search"),
			handler: () => {
				openChoicePicker({
					// title: "Reading List",
					fullScreen: true,
					inset: false,
					dismissible: false,
					noHeading: false,
					choices: async () => {
						const res = await sourceGet(
							{ handler: () => queryDb("reader") },
							{
								orderBy: "_index,desc",
							}
						);
						return res?.map(formatEntry);
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
				setState?.("random", true);
				refetch?.();
			},
		},
		// actions: [{ label: "Add Entry", icon: UI.icon("add"), handler: () => {} }],
	],
});

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
	// color: `linear-gradient(45deg, #d3ffff, #f2ddb0)`,
	color: "#3E3215",
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

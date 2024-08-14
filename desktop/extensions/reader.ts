import "../@types/index";

registerWidget("readerWatchList", {
	title: "Watch List",
	resolve: async () => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{ orderBy: "_index,desc", filters: { group: "📺 Watch" }, limit: 5 }
		);
		return res?.map((item) => {
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
		});
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
	// actions: [{ label: "Add Entry", icon: UI.icon("add"), handler: () => {} }],
	actionButton({ data }) {
		if (!data?.length) return;
		return {
			icon: UI.icon("add-circle"),
			label: "Preview First",
			handler: () => openUrl(data[0].url),
		};
	},

	listenForUpdates: "firebase-table-updated:readingList",
});

registerWidget("readingList", {
	title: "Learning List",
	resolve: async () => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{ orderBy: "_index,desc", filters: { group: "🧪 Learn" }, limit: 5 }
		);
		return res?.map((item) => {
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
		});
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
	actions: [{ label: "Add Entry", icon: UI.icon("add"), handler: () => {} }],
	listenForUpdates: "firebase-table-updated:readingList",
});

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

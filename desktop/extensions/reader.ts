import "../@types/index";

registerWidget("readerWatchList", {
	title: "Watch List",
	resolve: async () => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{ orderBy: "_index,desc", filters: { group: "📺 Watch" }, limit: 3 }
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
	content: UI.List,
	// actions: [{ label: "Add Entry", icon: UI.Icon("add"), handler: () => {} }],
	actionButton({ data }) {
		if (!data?.length) return;
		return {
			icon: UI.Icon("add-circle"),
			label: "Preview First",
			handler: () => openUrl(data[0].url),
		};
	},

	listenForUpdates: (callback = () => {}) => {
		const event = "firebase-table-updated:readingList";
		window.addEventListener(event, callback, false);
		return () => window.removeEventListener(event, callback, false);
	},
});

registerWidget("readingList", {
	title: "Reader",
	resolve: async () => {
		const res = await sourceGet(
			{ handler: () => queryDb("reader") },
			{ orderBy: "_index,desc" }
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
	content: UI.List,
	actions: [{ label: "Add Entry", icon: UI.Icon("add"), handler: () => {} }],
	listenForUpdates: (callback = () => {}) => {
		const event = "firebase-table-updated:readingList";
		window.addEventListener(event, callback, false);
		return () => window.removeEventListener(event, callback, false);
	},
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

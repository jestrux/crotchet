import "../../@types/index";

const appIcon = UI.svg(
	"M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621.504-1.125 1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621-.504-1.125-1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5",
	{
		filled: false,
	}
);

const formFields = {
	title: "text",
	description: "text",
	url: "text",
	image: "image",
	poster: "image",
	// type: {
	// 	type: "radio",
	// 	choices: ["movie", "tv"],
	// },
	season: "text",
	episode: "text",
	currentTime: "text",
};

const editEntry = (entry) => {
	const entity = entry.type?.toLowerCase() == "movie" ? "Movie" : "Show";
	return window.openPage({
		title: `Edit ${entity}`,
		type: "form",
		fields: _.omit(
			formFields,
			entry.type == "movie" ? ["season", "episode"] : []
		),
		resolve: () => entry,
		action: {
			label: "Save",
			successMessage: `${entity} saved`,
			handler: (data) => {
				if (!data) return;

				return window.dataSources.watchlist.updateRow(
					data._id,
					_.pick(data, Object.keys(formFields))
				);
			},
		},
	});
};

const getActions = (entry) => {
	return [
		{
			icon: window.UI.icon("open-external"),
			label: "Open",
			url: entry.url,
		},
		{
			icon: window.UI.icon("edit"),
			label: "Edit",
			handler: async () => await editEntry(entry),
		},
		{
			icon: window.UI.icon("delete"),
			label: "Delete",
			destructive: true,
			handler: async () =>
				window.withLoader(
					window.dataSources.watchlist.deleteRow(entry._id),
					{
						loadingMessage: "Deleting...",
						successMessage: "Entry deleted",
						errorMessage: "Failed to delete entry",
					}
				),
		},
	];
};

const mapEntry = (item, withActions = true) => {
	// const isVideo = item.type === "movie" || item.type === "tv";
	const isVideo = false;

	// Format progress text for TV shows
	let progressText = "";
	if (item.type === "tv" && item.season && item.episode) {
		progressText = `S${item.season}E${item.episode}`;
		if (item.currentTime && item.currentTime !== "00:00") {
			progressText += ` • ${item.currentTime}`;
		}
	} else if (item.currentTime && item.currentTime !== "00:00") {
		progressText = item.currentTime;
	}

	const entry = {
		...item,
		...(isVideo
			? { video: item.poster || item.image || "placeholder" }
			: { image: item.image || "placeholder" }),
		leading: appIcon,
		title: item.title || "Untitled",
		subtitle: progressText || item.description,
		tags: [item.type, ...(progressText ? ["In Progress"] : [])],
	};

	if (withActions) entry.actions = getActions(entry);

	return entry;
};

registerDataSource("db", "watchlist", {
	icon: appIcon,
	table: "watchlist",
	label: "Watchlist",
	mapEntry,
	searchFields: ["title", "description"],
	layoutProps: {
		layout: "grid",
		aspectRatio: onDesktop() ? "1/1.3" : "2/3",
		columns: "sm:2,2xl:3,4xl:4",
	},
	entryAction: (entry) => ({
		label: "Open",
		url: entry.url,
	}),
});

registerAction("scanToUpdateWatchlist", {
	label: "Scan to Update Watchlist",
	icon: appIcon,
	global: true,
	mobileOnly: true,
	handler: async () => {
		try {
			const result = await window.scanQRCode();

			if (!result) return window.showToast("No QR code data found");

			let data;
			try {
				data = JSON.parse(result);
			} catch (error) {
				return window.showToast("Invalid QR code data format");
			}

			if (!data.title || !data.url)
				return window.showToast(
					"QR code missing required fields (title, url)"
				);

			return window.openPage({
				type: "preview",
				resolve: async () => {
					const res = await window.queryDb("watchlist", {
						rowId: data._rowId,
					});

					return mapEntry({ ...data, ...(res._rowId ? res : {}) });
				},
				actions: ({ pageData }) => {
					if (!pageData) return null;

					return [
						{
							icon: window.UI.icon("edit"),
							label: "Edit current time",
							handler: async () => {
								const time = await window.openAlertForm({
									inset: false,
									noHeading: false,
									preview: {
										title: `Enter current time for ${pageData.title}`,
									},
									field: {
										floating: true,
										hideLabel: true,
										meta: {
											flat: true,
											bold: true,
										},
										value: pageData.currentTime,
									},
								});

								if (!time) return;

								await window.withLoader(
									async () =>
										await window.dataSources.watchlist.updateRow(
											pageData._rowId,
											{ currentTime: time }
										),
									{
										loadingMessage: "Saving new time",
										successMessage: `New time for ${pageData.title} set to: ${time}`,
									}
								);
							},
						},
						{
							icon: window.UI.icon("edit"),
							label: "Edit all details",
							handler: () => editEntry(pageData),
						},
					];
				},
			});
		} catch (error) {
			console.error("Scan to update watchlist error:", error);
			window.showToast("Failed to scan QR code");
		}
	},
});

registerWidget("watchlist", {
	icon: appIcon,
	title: "Watchlist",
	listenForUpdates: "firebase-table-updated:watchlist",
	source: "watchlist",
	resolve: async ({ state }) =>
		await sourceGet("watchlist", {
			orderBy: "_index,desc",
			random: state.random ?? true,
			limit: 5,
		}),
	content: UI.list,
	actions: [
		{
			label: "Search",
			icon: UI.icon("search"),
			url: "crotchet://search/watchlist",
		},
		{
			label: "Shuffle",
			icon: UI.icon("shuffle"),
			handler: ({ refetch, setState }) => {
				setState?.("random", true);
				refetch?.();
			},
		},
	],
});

registerAction("searchWatchList", {
	icon: appIcon,
	label: "Search Watch List",
	context: "search",
	source: "watchlist",
});

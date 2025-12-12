import "../../@types/index";

const appIcon = UI.svg(
	"M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z",
	{ filled: true }
);

const searchAction = {
	label: "Search Unsplash",
	icon: UI.icon("search"),
	url: "crotchet://search/unsplash",
};

const searchUnsplash = async (
	searchQuery = "",
	{ per_page = 30, page = 1 } = {}
) => {
	// const clientId = await getToken("UNSPLASH_CLIENT_ID");
	const clientId = "IPA5vpUYCbI5PWvpcEyNJZPov3L-Nc2qlGj3UctYCS4";
	if (!clientId) return null;

	let url = `https://api.unsplash.com/photos?client_id=${clientId}&page=${page}&per_page=${per_page}`;

	if (searchQuery?.length)
		url = `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${clientId}&page=${page}&per_page=${per_page}`;

	let data = await fetch(url).then((res) => res.json());

	return (data.results || data).map((entry) => {
		entry = {
			...entry,
			collection: entry.search,
			title: entry.alt_description,
			// subtitle: entry.description,
			subtitle: entry.user?.name || entry.description,
			image: entry.urls.regular,
			href: entry.links.html,
			url: entry.links.html,
			// url: `crotchet://copy/${entry.urls.regular}`,
		};

		entry.action = {
			label: "Copy",
			icon: UI.icon("open-external"),
			url: `crotchet://copy/${entry.urls.regular}`,
		};

		entry.actions = getImageActions(entry);

		return entry;
	});
};

const randomUnsplashPic = async () => {
	const page = random([1, 2, 3, 4]);
	const searchQuery = random([
		// "girl",
		// "face",
		"spring",
		"wilderness",
		"serene",
		"beach",
		"mountains",
		"retro",
		"interior design",
		"concert",
	]);

	return random(await searchUnsplash(searchQuery, { page }));
};

const getImageActions = (res, { shuffle = false, search = false } = {}) => {
	return [
		{
			label: "Copy Image Url",
			icon: UI.icon("copy"),
			handler: () =>
				copyToClipboard(res.urls.regular, "Image URL copied"),
		},
		{
			label: "Copy Image",
			icon: UI.icon("copy"),
			handler: () => copyImage(res.image, "Image copied"),
		},
		{
			label: "Share",
			icon: UI.icon("share"),
			handler: () => shareImage(res.image),
		},
		{
			label: "Copy Unsplash Link",
			icon: UI.icon("copy"),
			handler: () => copyToClipboard(res.links.html, "Link copied"),
		},
		{
			label: "Open on Unsplash",
			icon: UI.icon("open-external"),
			url: res.url,
		},
		...(shuffle
			? [
					{
						label: "Shuffle",
						icon: UI.icon("shuffle"),
						handler: () =>
							dispatch("refetch-random-unsplash-widget"),
					},
			  ]
			: []),
		...(search ? [searchAction] : []),
	];
};

const previewImage = async (image = null) => {
	return openPage({
		type: "preview",
		resolve: image ? () => image : randomUnsplashPic,
		action: ({ pageData }) =>
			!pageData
				? null
				: {
						label: "Open",
						handler: () => openUrl(pageData.href),
				  },
		actions: ({ pageData }) =>
			!pageData ? null : getImageActions(pageData),
	});
};

registerDataSource("custom", "unsplash", {
	icon: appIcon,
	listenForUpdates: "tokens-updated",
	fetch: () => {
		// TODO: Add caching logic
		return searchUnsplash();
	},
	search: searchUnsplash,
	// orderBy: "first",
	// mapEntry(item) {},
	layoutProps: {
		layout: "masonry",
	},
	// actions: () => [],
	// entryActions: getImageActions,
	// entryAction: previewImage,
});

registerAction("searchUnsplash", {
	label: "Search Unsplash",
	color: "#333",
	icon: appIcon,
	global: true,
	mobileOnly: true,
	tags: ["image"],
	url: "crotchet://search/unsplash",
});

registerAction("randomUnsplashPic", {
	label: "Random Pic",
	color: "#333",
	icon: appIcon,
	global: true,
	// context: "shortcut",
	tags: ["image"],
	handler: async () => previewImage(),
});

registerWidget("randomUnsplashPic", {
	icon: appIcon,
	label: "Random Pic",
	listenForUpdates: "refetch-random-unsplash-widget",
	onSwipe: ({ refetch }) => refetch(),
	resolve: async () => {
		const entry = await randomUnsplashPic();
		return {
			...entry,
			url: entry.href,
			actions: getImageActions(entry, {
				shuffle: true,
				search: true,
			}),
		};
	},
	content: UI.media,
	actions: [],
});

registerWidget("unsplash", {
	icon: appIcon,
	label: "Daily Pics",
	title: "Daily Pics",
	source: "unsplash",
	content: UI.grid,
	actions: [searchAction]
});

registerAction("searchUnsplash", {
	context: "share",
	icon: appIcon,
	match: "text",
	desktopOnly: true,
	handler: async ({ text }) => openUrl("crotchet://search/unsplash/" + text),
});

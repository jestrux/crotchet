import "../../@types/index";

const searchUnsplash = async (searchQuery = "") => {
	// const clientId = await getToken("UNSPLASH_CLIENT_ID");
	const clientId = "IPA5vpUYCbI5PWvpcEyNJZPov3L-Nc2qlGj3UctYCS4";
	if (!clientId) return null;

	const page = random([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	let url = `https://api.unsplash.com/photos?client_id=${clientId}&page=${page}&per_page=30`;

	if (searchQuery?.length)
		url = `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${clientId}`;

	let data = await fetch(url).then((res) => res.json());

	return (data.results || data).map((entry) => ({
		...entry,
		collection: entry.search,
		title: entry.alt_description,
		// subtitle: entry.description,
		subtitle: entry.user?.name || entry.description,
		image: entry.urls.regular,
		href: entry.links.html,
		url: `crotchet://copy/${entry.urls.regular}`,
	}));
};

const randomUnsplashPic = async () => random(await searchUnsplash());

registerAction("randomUnsplashPic", {
	label: "Random Pic",
	icon: UI.svg(
		"M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z",
		{ filled: true }
	),
	global: true,
	context: "shortcut",
	tags: ["image"],
	handler: async () => {
		if (onDesktop()) {
			try {
				return openPage({
					type: "detail",
					title: ({ pageData }) => pageData?.title || null,
					resolve: randomUnsplashPic,
					content: ({ pageData }) => {
						if (!pageData) return null;

						return UI.component({
							className:
								"absolute inset-0 bg-black flex items-center justify-center",
							content: !pageData
								? ""
								: `<img class="max-w-full h-full" src="${pageData.image}" />`,
						});
					},
					action: ({ pageData }) =>
						!pageData
							? null
							: {
									label: "Open",
									handler: () => openUrl(pageData.href),
							  },
					actions: ({ pageData }) =>
						!pageData
							? null
							: [
									{
										label: "Copy",
										handler: () => {
											copyToClipboard(pageData.image);
											showToast("Image copied");
										},
									},
							  ],
				});
			} catch (error) {
				showToast("Failed to get clip");
			}

			return;
		}

		window.openActionSheet({
			noHeading: true,
			actions: async () => {
				try {
					const images = await searchUnsplash();

					if (!images) return showToast("Failed to get image");

					const res = random(images);

					window.openActionSheet({
						preview: _.pick(res, ["image", "title", "subtitle"]),
						actions: [
							{
								label: "Copy",
								icon: UI.icon("copy"),
								handler: () => {
									copyFromUrl(res.image);
									showToast("Image copied");
								},
							},
							{
								label: "Share",
								icon: UI.icon("share"),
								handler: () => shareImage(res.image),
							},
							{
								label: "Open",
								icon: UI.icon("open-external"),
								url: res.image,
							},
						],
					});
				} catch (error) {
					showToast("Failed to get image");
				}
			},
		});
	},
});

registerWidget("randomUnsplashPic", {
	listenForUpdates: "refetch-random-unsplash-widget",
	// onSwipe: ({ refetch }) => refetch(),
	resolve: async () => {
		const entry = await randomUnsplashPic();
		return {
			...entry,
			url: entry.href,
			actions: [
				{
					label: "Shuffle",
					icon: UI.icon("shuffle"),
					handler: () => dispatch("refetch-random-unsplash-widget"),
				},
			],
		};
	},
	content: UI.media,
});

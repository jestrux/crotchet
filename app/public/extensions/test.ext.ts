import "../../../@types/index";

registerAction("setHeroLocalNewCallsheetNavigation", {
	label: "New Callsheet Navigation",
	global: true,
	desktopOnly: true,
	url: `crotchet://socket/run?command=open /Users/waky/Library/Application\\ Support/Electron/Crotchet`,
});

registerAction("testPic", {
	global: true,
	desktopOnly: true,
	// context: "shortcut",
	tags: ["image"],
	handler: async () => {
		const imageUrl =
			"https://images.unsplash.com/photo-1745563115146-aec349b7cadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNjE2NXwwfDF8YWxsfDIyfHx8fHx8Mnx8MTc0ODAwNDQ5M3w&ixlib=rb-4.1.0&q=80&w=1080";

		if (onDesktop()) {
			return openPage({
				type: "detail",
				title: "Random Unsplash Pic",
				content: () =>
					UI.component({
						className:
							"absolute inset-0 bg-black flex items-center justify-center",
						content: `<img class="max-w-full h-full" src="${imageUrl}" />`,
					}),
				action: {
					label: "Open",
					handler: () => openUrl(imageUrl),
				},
				actions: [
					{
						label: "Copy",
						handler: () => {
							copyToClipboard(imageUrl);
							showToast("Image copied");
						},
					},
				],
			});
		}

		window.openActionSheet({
			noHeading: true,
			actions: [
				{
					label: "Copy",
					icon: UI.icon("copy"),
					handler: () => {
						copyFromUrl(imageUrl);
						showToast("Image copied");
					},
				},
				{
					label: "Share",
					icon: UI.icon("share"),
					handler: () => shareImage(imageUrl),
				},
				{
					label: "Open",
					icon: UI.icon("open-external"),
					url: imageUrl,
				},
			],
		});
	},
});

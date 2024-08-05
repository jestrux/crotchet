import "../@types/index";

const getYoutubeId = (url) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

const getYoutubeUrl = (payload) => {
	const { _id, crop, duration } = payload || {};
	const [start] = (crop || [0, duration]).map(Number);
	return `https://youtube.com/watch?v=${_id}&t=${start.toFixed(0)}`;
};

registerWidget("youtubeClips", {
	title: "Youtube Clips",
	resolve: async () => {
		const res = await sourceGet(
			{ handler: () => queryDb("youtubeClips") },
			{ orderBy: "updatedAt,desc" }
		);
		return res?.map((entry) => ({
			...entry,
			video: `https://i.ytimg.com/vi/${entry._id}/hqdefault.jpg`,
			title: entry.name,
			subtitle: `${[entry.crop?.[0], entry.crop?.[1]]
				?.map(toHms)
				.join(", ")} - ${toHms(entry.duration)}`,
			url: getYoutubeUrl(entry),
		}));
	},
	content: UI.List,
	actionButton: () => {
		return { label: "Add Clip", icon: UI.Icon("add"), handler: () => {} };
	},
	listenForUpdates: (callback = () => {}) => {
		const event = "firebase-table-updated:youtubeClips";
		window.addEventListener(event, callback, false);
		return () => window.removeEventListener(event, callback, false);
	},
});

registerAction("addToYoutubeClips", {
	label: "Add to Youtube Clips",
	context: "share",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: async (payload) => {
		showAlert(`${JSON.stringify(payload)} - youtube clips!!!`);
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

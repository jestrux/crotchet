import "../@types/index";

const getYoutubeId = (url) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

registerAction("addToYoutubeClips", {
	label: "Add to Youtube Clips",
	context: "share",
	match: ({ url }) => url?.toString().length && getYoutubeId(url),
	handler: async (payload) => {
		alert(`${JSON.stringify(payload)} - youtube clips!!!`);
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

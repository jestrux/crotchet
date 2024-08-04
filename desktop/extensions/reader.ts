import "../@types/index";

registerAction("addToReadingList", {
	label: "Add to reading list",
	context: "share",
	match: ({ url }) => url?.toString().length,
	handler: async (payload) => {
		alert(`${JSON.stringify(payload)} - reading list!!!`);
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

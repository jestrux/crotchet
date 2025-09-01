const googleImagenPromptsFilters = [
	{ label: "Photo Realistic", value: "photorealistic" },
	{ label: "Cinematic", value: "cinematic" },
	{ label: "Hyper Realistic", value: "hyperrealistic" },
	{ label: "Photograph", value: "photograph" },
];

registerDataSource("custom", "googleImagenPrompts", {
	icon: UI.icon("ai"),
	fetch: async () => {
		let data = await crawlUrl("https://deepmind.google/models/imagen", {
			matcher:
				".glue-carousel__item=>image::.picture__image::src|prompt::.caption__text",
		});

		if (data?.length) {
			data = data.reduce((agg, item) => {
				if (!item.prompt?.length) return agg;

				item.prompt = item.prompt.replace("Prompt: ", "").trim();

				if (item.prompt.endsWith(" -")) {
					item.prompt = item.prompt.substring(
						0,
						item.prompt.length - 2
					);
				}

				let itemFilters = _.map(
					googleImagenPromptsFilters,
					"value"
				).reduce((agg, filter) => {
					const index = item.prompt
						.toLowerCase()
						.replaceAll(" ", "")
						.indexOf(filter.toLowerCase().replaceAll(" ", ""));

					if (index != -1) {
						// @ts-ignore
						agg.push({
							filter,
							index,
						});
					}

					return agg;
				}, []);

				return [
					...agg,
					{
						leading: UI.icon("ai"),
						title: item.prompt,
						type: _.map(_.orderBy(itemFilters, "index"), "filter"),
						action: {
							label: "Preview",
							handler: () => {},
						},
						preview: () => {
							return UI.previewWithMeta({
								data: {
									layout: "portrait",
									image: item.image,
									description: item.prompt,
								},
							});
						},
					},
				];
			}, []);
		}

		return data;
	},
	filter: {
		field: "type",
		defaultValue: "",
	},
	filters: [{ label: "All", value: "" }, ...googleImagenPromptsFilters],
});

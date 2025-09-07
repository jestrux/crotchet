import "../../@types/index";

const googleImagenPromptsFilters = [
	{ label: "Photo Realistic", value: "photorealistic" },
	{ label: "Cinematic", value: "cinematic" },
	{ label: "Hyper Realistic", value: "hyperrealistic" },
	{ label: "Photograph", value: "photograph" },
];

const appIcon = UI.icon("ai");
registerDataSource("custom", "googleImagenPrompts", {
	icon: appIcon,
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
						// Hide image in desktop list view
						trailing: " ",
						image: item.image,
						title: item.prompt,
						type: _.map(_.orderBy(itemFilters, "index"), "filter"),
					},
				];
			}, []);
		}

		return data;
	},
	layoutProps: onDesktop()
		? {
				layout: "list",
		  }
		: {
				layout: "grid",
				aspectRatio: "16/9",
		  },
	filter: {
		field: "type",
		defaultValue: "",
	},
	filters: googleImagenPromptsFilters,
	entryActions: (item) =>
		onDesktop()
			? []
			: [
					{
						label: "Preview",
						url: item.image,
					},
			  ],
	entryAction: (item) => ({
		label: "Preview",
		handler: () => {
			openPage({
				type: "preview",
				resolve: () => ({
					image: item.image,
					description: item.title,
				}),
			});
		},
	}),
	entryPreview: (item) => {
		return UI.previewWithMeta({
			data: {
				layout: "portrait",
				image: item.image,
				description: item.title,
			},
		});
	},
});

registerWidget("googleImagenPrompts", {
	icon: appIcon,
	title: "Google Imagen Prompts",
	source: "googleImagenPrompts",
	content: ({ data, loading }) => {
		if (loading) return;
		return UI.list({ data });
	},
	actions: [
		{
			label: "View",
			icon: UI.icon("search"),
			url: "crotchet://search/googleImagenPrompts",
		},
	],
});

import "../../@types/index";

const appIcon = UI.svg(
	"M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
	{}
);

const searchAction = {
	icon: "search",
	label: "All Prompts",
	url: `crotchet://search/promptFun`,
};

registerDataSource("db", "promptFun", {
	orderBy: "updatedAt,desc",
	layoutProps: {
		layout: "grid",
		columns: 2,
	},
	mapEntry: (entry) => ({
		...entry,
		aspectRatio: entry.meta?.aspectRatio,
		label: entry.title,
		subtitle: entry.prompt,
		url: onDesktop() ? entry?.meta.gridUrl : getPreviewUrl(entry),
		share: getPreviewUrl(entry),
	}),
	actions: [],
	entryAction: (entry) => {
		return {
			label: "Open",
			url: entry.url,
		};
	},
	entryPreview: (entry) => {
		if (!entry?.meta.gridUrl) return null;

		return window.UI.component({
			content: `
                <img src="${entry?.meta.gridUrl}" class="absolute inset-0 size-full object-contain object-center bg-black" />
            `,
		});
	},
});

registerWidget("promptFun", {
	icon: appIcon,
	title: "Prompt Fun",
	label: "Recent Prompts",
	resolve: () =>
		sourceGet("promptFun", {
			orderBy: "_index,desc",
			limit: 8,
		}),
	content: UI.grid,
	actions: [
		{
			icon: UI.icon("search"),
			label: "Search",
			url: "crotchet://search/promptFun",
		},
	],
	entryActions: () => [searchAction],
});

registerAction("randomPrompt", {
	label: "Random Prompt",
	icon: appIcon,
	color: "#788AF7",
	global: true,
	tags: ["ai"],
	handler: async () => {
		window.openPage({
			type: "preview",
			resolve: async () =>
				sourceGet("promptFun", {
					orderBy: "updatedAt,desc",
					random: true,
					single: true,
				}),
		});
	},
});

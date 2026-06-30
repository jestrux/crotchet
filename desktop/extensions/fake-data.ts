import "../../@types/index";

const appIcon = UI.svg(
	"M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
	{ filled: false }
);

const filters = ["person", "male", "female"];

const formFields = {
	title: "text",
	subtitle: "text",
	image: "text",
	tags: "text",
};

const addEntry = () => {
	window.openPage({
		type: "form",
		fields: formFields,
		action: {
			label: "Save",
			successMessage: "Entry added",
			handler: (data) => {
				if (!data) return;
				return window.dataSources.fakeData.addRow(data);
			},
		},
	});
};

registerDataSource("db", "fakeData", {
	icon: appIcon,
	table: "fakeData",
	label: "Fake Data",
	searchFields: ["title", "subtitle", "tags"],
	layoutProps: {
		layout: "grid",
		columns: "sm:2,2xl:3,4xl:4",
	},
	actions: [
		{
			label: "Add Entry",
			handler: addEntry,
		},
	],
	mapEntry: (data) => {
		if (typeof data === "string") return data;
		return {
			...data,
			type: data.tags?.split(",").map((t) => t.trim()) || [],
		};
	},
	filter: {
		field: "type",
		defaultValue: "",
	},
	filters,
	entryAction: (entry) => ({
		label: "Copy",
		icon: UI.icon("copy"),
		handler: () =>
			copyToClipboard(
				JSON.stringify(_.pick(entry, ["image", "title", "subtitle", "tags"]), null, 2),
				"Entry copied"
			),
	}),
	entryActions: (entry) => [
		{
			icon: window.UI.icon("copy"),
			label: "Copy Image",
			shortcut: "Shift + Option + I",
			section: "Quick Actions",
			handler: () => copyToClipboard(entry.image, "Image URL copied"),
		},
		{
			icon: window.UI.icon("add"),
			label: "Add Entry",
			section: "Quick Actions",
			handler: addEntry,
		},
		{
			icon: window.UI.icon("edit"),
			label: "Edit",
			handler: () => {
				window.openPage({
					type: "form",
					fields: formFields,
					resolve: () => entry,
					action: {
						label: "Save",
						handler: (data) => {
							if (!data) return;
							return window.dataSources.fakeData.updateRow(
								data._id,
								_.pick(data, Object.keys(formFields))
							);
						},
					},
				});
			},
		},
		{
			icon: window.UI.icon("delete"),
			label: "Delete",
			destructive: true,
			handler: async () =>
				window.withLoader(
					window.dataSources.fakeData.deleteRow(entry._id),
					{
						loadingMessage: "Deleting...",
						successMessage: "Entry deleted",
						errorMessage: "Failed to delete entry",
					}
				),
		},
	],
});

registerWidget("fakeDataPeople", {
	icon: appIcon,
	label: "People",
	title: "Fake People",
	listenForUpdates: "firebase-table-updated:fakeData",
	source: "fakeData",
	resolve: async () =>
		await sourceGet("fakeData", {
			filter: "tags,person",
			orderBy: "_index,desc",
			random: true,
			limit: 5,
		}),
	content: UI.list,
	actions: [
		{
			label: "Search",
			icon: UI.icon("search"),
			url: "crotchet://search/fakeData",
		},
		{
			label: "Shuffle",
			icon: UI.icon("shuffle"),
			handler: ({ refetch }) => {
				refetch?.();
			},
		},
	],
});

registerAction("searchFakeData", {
	icon: appIcon,
	label: "Search Fake Data",
	context: "search",
	source: "fakeData",
});

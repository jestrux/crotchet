import { registerAction, registerDataSource } from "@/crotchet";
import { getShareUrl } from "@/crotchet/utils";

export default function pinnedItems() {
	const icon = (
		<svg viewBox="0 0 16 16" fill="currentColor">
			<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146m.122 2.112v-.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a5 5 0 0 0-.288-.076 5 5 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a5 5 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034q.172.002.343-.04L9.927 2.028q-.042.172-.04.343a1.8 1.8 0 0 0 .062.46z" />
		</svg>
	);

	const formFields = {
		text: "text",
		url: { type: "text", optional: true },
		image: { type: "image", optional: true },
		file: { type: "image", optional: true },
	};

	const getAddToPinnedItemsAction = () => {
		return {
			label: "Add to Pinned Items",
			handler: async (value) =>
				window.openForm({
					title: "Add to Pinned Items",
					fields: formFields,
					resolve: async () => {
						const res = value
							? typeof value === "string"
								? { text: value }
								: value
							: await window
									.readClipboard()
									.then((res) => ({ text: res.value }));

						if (!res) return;

						const { payload, preview } =
							window.processShareData(res.text, res.type, {
								fromClipboard: true,
							}) || {};

						let data = {
							...payload,
							...preview,
						};

						if (data.url && !data.image) {
							const res = await window.crawlUrl(data.url);
							if (res.meta) {
								data.image = res.meta.image;
								data.text = res.meta.title;
							}
						}

						// let asset = file || image;
						// if (asset && !asset.startsWith("http")) {
						// 	url = await uploadDataUrl(asset);
						// 	if (!file) image = url;
						// }

						data = _.pick(data, Object.keys(formFields));

						console.log(data);

						return data;
					},
					action: {
						label: "Save",
						loadingMessage: "Adding to pinned items...",
						successMessage: "Added to pinned items",
						errorMessage: "Failed add to pinned items",
						handler: async (pinnedItem) =>
							await window.dataSources.pinnedItems.insertRow(
								pinnedItem
							),
					},
				}),
		};
	};

	registerDataSource("db", "pinnedItems", {
		orderBy: "updatedAt,desc",
		mapEntry: (entry) => ({
			...entry,
			title: entry.text || entry.title || entry.url,
			label: entry.text || entry.title || entry.url,
			text: entry.text || entry.title || entry.url,
			subtitle: entry.url == entry.text ? null : entry.url,
			url: entry.url || "crotchet://copy/" + (entry.text || entry.title),
			image: entry.image,
			share: getShareUrl({
				scheme: "pinnedItems",
				state: entry,
			}),
		}),
		actions: [getAddToPinnedItemsAction()],
		entryAction: (entry) => {
			return {
				label: "Open",
				url: entry.url,
			};
		},
		entryActions: (entry) => {
			return [
				{
					icon: window.UI.icon("open-external"),
					label: "Open",
					url: entry.url,
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

									return window.dataSources.pinnedItems.updateRow(
										data._id,
										data
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
							window.dataSources.pinnedItems.deleteRow(entry._id),
							{
								loadingMessage: "Deleting...",
								successMessage: "Pinned item deleted",
								errorMessage: "Failed to delete pinned item",
							}
						),
				},
			];
		},
		entryPreview: (entry) => {
			if (!entry.image) return null;

			return window.UI.component({
				content: `
                    <img src="${entry.image}" class="absolute inset-0 size-full object-contain object-center bg-black" />
                `,
			});
		},
	});

	registerAction("addToPinnedItems", {
		context: "share",
		icon,
		// match: ({ text, url, image, file } = {}) =>
		// 	Object.values(cleanObject({ text, url, image, file })).length,
		handler: (payload) => {
			getAddToPinnedItemsAction().handler(payload);
		},
	});

	registerAction("pinboard", {
		color: "#22C55E",
		icon: (
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146" />
			</svg>
		),
		mobileOnly: true,
		handler: () => {
			window.openPage({
				title: "Pinboard",
				source: "pinnedItems",
			});
		},
	});
}

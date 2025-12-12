import { Capacitor } from "@capacitor/core";

export default async function processBackgroundAction(action) {
	if (!action || !action.type) {
		console.error("Invalid background action:", action);
		return;
	}

	const { type, payload = {} } = action;

	// Widget refresh action
	if (type === "widget-refresh") {
		const { source, widgetSize } = payload;

		if (!source || !window.dataSources?.[source]) {
			return;
		}

		try {
			// Only refresh the specific widget size
			if (widgetSize === "small") {
				// Fetch single random item for Random widget
				const randomSingle = await window.dataSources[source].get({
					shuffle: true,
					single: true,
				});

				if (randomSingle?.title) {
					const randomData = {
						video: randomSingle.video,
						image: randomSingle.image,
						title: randomSingle.title,
						subtitle: randomSingle.subtitle,
						url: randomSingle.url,
						_id: randomSingle._id,
					};

					await window.syncWidgetData(source + "Random", randomData);
				}
			} else if (widgetSize === "medium") {
				// Fetch 6 random items for RandomList widget
				const randomList = await window.dataSources[source].get({
					shuffle: true,
					limit: 6,
				});

				if (randomList?.length > 0) {
					const listData = randomList.slice(0, 6).map((item) => ({
						video: item.video,
						image: item.image,
						title: item.title,
						subtitle: item.subtitle,
						url: item.url,
						_id: item._id,
					}));

					await window.syncWidgetData(
						source + "RandomList",
						listData
					);
				}
			}

			await window.reloadWidgetTimelines();
		} catch (error) {
			console.error("Failed to refresh widget data:", error);
		}

		return;
	}

	// Add more action types here as needed
}

export const setupBackgroundActionListener = () => {
	if (!Capacitor.isNativePlatform()) return;

	// Listen for BackgroundAction CustomEvent
	window.addEventListener("BackgroundAction", async (event) => {
		try {
			// event.detail contains the parsed JSON object
			const action = event.detail;

			// Process the background action
			await processBackgroundAction(action);
		} catch (error) {
			console.error("Error in BackgroundAction handler:", error);
		}
	});
};

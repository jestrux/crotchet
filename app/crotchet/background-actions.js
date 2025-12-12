import { Capacitor } from "@capacitor/core";
import { sourceGet } from "./hooks/useSourceGet";

export default async function processBackgroundAction(action) {
	if (!action || !action.type) {
		console.error("Invalid background action:", action);
		return;
	}

	const { type, payload = {} } = action;

	// window.showLocalNotification("Handle background action:", type);

	// Widget refresh action
	if (type === "widget-refresh") {
		const { source, widgetSize } = payload;

		if (!source || !window.dataSources?.[source]) {
			return console.log("Unknown source: ", source);
		}

		try {
			// Only refresh the specific widget size
			if (widgetSize === "small") {
				// Fetch single random item for Random widget
				const randomSingle = await sourceGet(source, {
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
					console.log("Refreshed data for:", source + "Random");
				}
			} else if (["medium", "large", "extraLarge"].includes(widgetSize)) {
				// Fetch 12 random items for RandomList widget
				const randomList = await sourceGet(source, {
					shuffle: true,
					limit: 12,
				});

				if (randomList?.length > 0) {
					const listData = randomList.slice(0, 12).map((item) => ({
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

					// window.showToast(
					// 	"Refreshed data for:",
					// 	source + "RandomList"
					// );
					// window.showLocalNotification("Refreshed data for:", source + "RandomList");
					console.log("Refreshed data for:", source + "RandomList");
				}
			} else {
				// window.showToast("Unsupported size:", widgetSize);
				console.log("Unsupported size:", widgetSize);
			}

			await window.reloadWidgetTimelines();
		} catch (error) {
			// window.showToast("Failed to refresh widget data:", error);
			// window.showLocalNotification("Failed to refresh widget data:", error?.message || "Unknown error");
			console.error("Failed to refresh widget data:", error);
		}

		return;
	}

	window.showToast("Unsupported background action:", type);

	// Add more action types here as needed
}

export const setupBackgroundActionListener = () => {
	if (!Capacitor.isNativePlatform()) return;

	// Listen for CrotchetBackgroundAction CustomEvent
	window.addEventListener("CrotchetBackgroundAction", async (event) => {
		try {
			// event.detail contains the parsed JSON object
			const action = event.detail;

			// Process the background action
			await processBackgroundAction(action);
		} catch (error) {
			console.error("Error in CrotchetBackgroundAction handler:", error);
		}
	});
};

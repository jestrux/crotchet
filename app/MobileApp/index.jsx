import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import registerPlatformUtils from "@/crotchet/registerPlatformUtils";
import { fetchImage, someTime } from "@/crotchet/utils";
import { setupDeepLinking } from "@/crotchet/deep-linking";
import { setupBackgroundActionListener } from "@/crotchet/background-actions";
// import { Loader } from "@/crotchet/components";

import CrotchetHomePage from "./CrotchetHomePage";
import ReceiveShareIntent from "./ReceiveShareIntent";
// import AppScaffold from "@/crotchet/providers/AppScaffold";

registerPlatformUtils({
	readClipboard: async () => await Clipboard.read(),
	copyToClipboard: async (content, message = "Copied") => {
		if (!content?.length) return console.log("Nothing to copy: ", content);

		try {
			await Clipboard.write({
				string: content,
				url: content,
			});

			window.showToast(message);
		} catch (error) {
			console.log("Error copying text: ", error);
			throw "Failed to copy!";
		}
	},
	copyImage: async (content, message = "Copied") => {
		if (!content?.length) return console.log("Nothing to copy: ", content);

		try {
			const image = await fetchImage(content);

			await Clipboard.write({
				image,
			});

			window.showToast(message);
		} catch (error) {
			console.log("Error copying text: ", error);
			throw "Failed to copy!";
		}
	},
	getFile: (props) => {
		console.log("Get file: ", props);
	},
	readFile: async (props, withStats) => {
		try {
			var stats;
			var options = {
				path: props.name || props.path,
				directory: Directory.Documents,
				encoding: Encoding.UTF8,
			};

			if (withStats) {
				stats = await Filesystem.stat(options);
				stats = !stats
					? {}
					: {
							...stats,
							createdAt: stats.ctime,
							updatedAt: stats.mtime,
					  };
			}

			let contents = (await Filesystem.readFile(options))?.data;

			if (contents?.length) {
				try {
					contents = JSON.parse(contents);
				} catch (_) {
					//
				}
			}

			if (withStats)
				return {
					stats,
					contents,
				};

			return contents;
		} catch (error) {
			// window.showToast("Read file failed: " + error);
			// console.log("Error reading file: ", error);
		}
	},
	// readNetworkFile: async (url) => {
	// 	window.socketEmit("read-network-file", { url });
	// },
	writeFile: async (props = {}, contents, { folder, open } = {}) => {
		try {
			return await Filesystem.writeFile({
				path: props.path || props.name,
				data: contents,
				directory: Directory.Documents,
				encoding: Encoding.UTF8,
				recursive: true,
			});
		} catch (error) {
			// console.log("Write file error: ", error);
		}
	},
	share: (payload) => Share.share(payload),
	hideApp: async () => {
		try {
			if (Capacitor.getPlatform() === "android") {
				await CapacitorApp.minimizeApp();
			} else if (Capacitor.getPlatform() === "ios") {
				if (window.minimizeAppIos) {
					await window.minimizeAppIos();
				}
			}
		} catch (error) {
			console.error("hideApp error:", error);
		}
	},
	showLocalNotification: async (titleOrDescriptionOrProps, description) => {
		let title, body;

		// Parse arguments: (title, description) or (description) or ({title, description})
		if (typeof titleOrDescriptionOrProps === "string") {
			if (description) {
				// Two strings: (title, description)
				title = titleOrDescriptionOrProps;
				body = description;
			} else {
				// One string: (description)
				title = "Notification";
				body = titleOrDescriptionOrProps;
			}
		} else if (typeof titleOrDescriptionOrProps === "object") {
			// Object: ({title, description})
			title = titleOrDescriptionOrProps.title || "Notification";
			body =
				titleOrDescriptionOrProps.description ||
				titleOrDescriptionOrProps.body;
		}

		if (!body) return;

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_BASE_URL}/firebase/notify?` +
					new URLSearchParams({
						topic: "crotchet-background-activity",
						title,
						body,
						data: JSON.stringify({
							type: "local-notification",
							title,
							message: body,
						}),
					})
			);

			return response.ok;
		} catch (error) {
			console.error("Failed to send local notification:", error);
			return false;
		}
	},
	oauthRedirectUrl: Capacitor.isNativePlatform()
		? "crotchet://"
		: new URL(location.href).origin,
});

setupDeepLinking();
setupBackgroundActionListener();

window.onIos = () =>
	Capacitor.isNativePlatform() && Capacitor.getPlatform() == "ios";

window.reloadWidgetTimelines = async (ofKind) => {
	const { WidgetsBridgePlugin } = await import(
		"capacitor-widgetsbridge-plugin"
	);

	if (ofKind) return await WidgetsBridgePlugin.reloadTimelines({ ofKind });

	return await WidgetsBridgePlugin.reloadAllTimelines();
};

window.syncWidgetData = async (key, value, ofKind) => {
	const { WidgetsBridgePlugin } = await import(
		"capacitor-widgetsbridge-plugin"
	);

	await WidgetsBridgePlugin.setItem({
		key,
		value: typeof value == "string" ? value : JSON.stringify(value),
		group: "group.tz.co.crotchet",
	});

	await someTime();

	if (ofKind) return await WidgetsBridgePlugin.reloadTimelines({ ofKind });

	return await WidgetsBridgePlugin.reloadAllTimelines();
};

export default function MobileApp() {
	// const { initializing } = useCrotchetApp();

	// useEffect(() => {
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);

	// if (initializing) return <div className="py-12" />;

	// if (app?.homePage)
	// 	return <AppScaffold key={app?.homePage._id} rootPage={app?.homePage} />;

	return (
		<>
			<CrotchetHomePage />
			<ReceiveShareIntent />
		</>
	);
}

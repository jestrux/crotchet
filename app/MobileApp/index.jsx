import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";
import { App as CapacitorApp } from "@capacitor/app";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import registerPlatformUtils from "@/crotchet/registerPlatformUtils";
import { dispatch, fetchImage } from "@/crotchet/utils";
// import { Loader } from "@/crotchet/components";

import CrotchetHomePage from "./CrotchetHomePage";
import { processSchemeUrl } from "@/crotchet/open-url";
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
});

const setupLaunchListener = () => {
	CapacitorApp.addListener("appUrlOpen", async (event) => {
		if (window.appUrlOpenHandlerTimeout) {
			clearTimeout(window.appUrlOpenHandlerTimeout);
			window.appUrlOpenHandlerTimeout = null;
		}

		window.appUrlOpenHandlerTimeout = setTimeout(() => {
			const args = processSchemeUrl(event?.url)?.args;
			window.appLaunchArgs = null;
			if (!args) return;

			window.appLaunchArgs = args;

			setTimeout(() => {
				dispatch("app-launched");
			}, 500);
		}, 10);
	});

	return () => {
		CapacitorApp.removeAllListeners();
	};
};

setupLaunchListener();

export default function MobileApp() {
	// const { initializing } = useCrotchetApp();

	// useEffect(() => {
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);

	// if (initializing) return <div className="py-12" />;

	// if (app?.homePage)
	// 	return <AppScaffold key={app?.homePage._id} rootPage={app?.homePage} />;

	return <CrotchetHomePage />;
}

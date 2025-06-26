import { useEffect } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import registerPlatformUtils from "@/crotchet/registerUtils";
import { openUrl } from "@/crotchet";
import { SendIntent } from "send-intent";
import { getLinksFromText, isValidUrl, objectIsEmpty } from "@/crotchet/utils";
import { useCrotchetApp } from "@/crotchet/providers/AppProvider";
// import { Loader } from "@/crotchet/components";

import CrotchetHomePage from "./CrotchetHomePage";
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
	getFile: (props) => {
		console.log(props);
	},
	readFile: async (props) => {
		try {
			var res = await Filesystem.readFile({
				path: props.name || props.path,
				directory: Directory.Documents,
				encoding: Encoding.UTF8,
			});

			let contents = res?.data;

			if (contents?.length) {
				try {
					contents = JSON.parse(contents);
				} catch (_) {
					//
				}
			}

			return contents;
		} catch (error) {
			// window.showToast("Read file failed: " + error);
		}
	},
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
			//
			console.log("Write file error: ", error);
		}
	},
	share: (payload) => Share.share(payload),
});

export default function MobileApp() {
	const { initializing } = useCrotchetApp();
	const handleShareIntent = async (result, fromOpen) => {
		// window.showAlert(
		// 	"Handle share: " + JSON.stringify({ result, fromOpen })
		// );

		if (window.shareTimeout) {
			clearTimeout(window.shareTimeout);
			window.shareTimeout = null;
		}

		try {
			if (!fromOpen) {
				result = await SendIntent.checkSendIntentReceived();

				if (!result.url?.length && !result.title?.length) {
					if (window.openTimeout) {
						clearTimeout(window.openTimeout);
						window.openTimeout = null;
					}

					return;
				}
			}

			let resultUrl = decodeURIComponent(result.url || result.title);
			let [, resultType] = decodeURIComponent(result.type).split("/");
			let payload = {
				incoming: true,
				type: resultType,
			};
			let preview = {
				image: null,
				title: null,
				subtitle: null,
			};

			if (resultType == "plain") {
				preview.subtitle = resultUrl;

				if (isValidUrl(resultUrl)) payload.url = resultUrl;
				else {
					payload.text = resultUrl;
					payload.url = getLinksFromText(resultUrl, true);
				}
			} else if (["jpg", "png"].includes(resultType)) {
				preview.title = resultUrl.split("/").at(-1).split(".").at(0);
				preview.subtitle = `image/${resultType}`;
				preview.type = `image/${resultType}`;
				var file = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:image/${resultType};base64,${content.data}`
				);
				payload.file = file;
				preview.image = file;
			} else if (["pdf"].includes(resultType)) {
				preview.title = resultUrl.split("/").at(-1).split(".").at(0);
				preview.subtitle = `document/${resultType}`;
				payload.type = `document/${resultType}`;
				payload.file = await Filesystem.readFile({
					path: resultUrl,
				}).then(
					async (content) =>
						`data:application/${resultType};base64,${content.data}`
				);
			}

			if (
				objectIsEmpty(_.pick(payload, ["text", "image", "url", "file"]))
			)
				return;

			setTimeout(() => {
				window.openActionSheet({
					title: "Select an action",
					payload,
					preview: !objectIsEmpty(preview) ? preview : null,
				});
			}, 300);
		} catch (error) {
			window.showAlert("App launch error: " + error);
			// alert("Share error: " + error);
		}
	};

	// eslint-disable-next-line no-unused-vars
	const listenForOpen = () => {
		CapacitorApp.addListener("appUrlOpen", async (event) => {
			const result = await SendIntent.checkSendIntentReceived();

			if (
				result.url?.length ||
				result.title?.length ||
				result.description?.length
			) {
				handleShareIntent(result, true);
				return;
			}

			if (window.openTimeout) {
				clearTimeout(window.openTimeout);
				window.openTimeout = null;
			}

			try {
				window.openTimeout = setTimeout(async () => {
					openUrl(decodeURIComponent(event.url));
				}, 10);
			} catch (error) {
				// alert("Error: " + error);
			}
		});
	};

	useEffect(() => {
		// listenForOpen();
		// return () => {
		// 	window.removeEventListener(
		// 		"sendIntentReceived",
		// 		handleShareIntent,
		// 		false
		// 	);
		// 	CapacitorApp.removeAllListeners();
		// };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// if (initializing) return <div className="py-12" />;

	// if (app?.homePage)
	// 	return <AppScaffold key={app?.homePage._id} rootPage={app?.homePage} />;

	return <CrotchetHomePage />;
}

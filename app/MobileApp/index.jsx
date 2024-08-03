import { useEffect } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import registerPlatformUtils from "@/crotchet/registerUtils";
import AppContent from "./AppContent";
import { openUrl } from "@/crotchet";
import { SendIntent } from "send-intent";
import { getLinksFromText, isValidUrl, objectIsEmpty } from "@/crotchet/utils";

registerPlatformUtils({
	showToast: (...toast) => {
		const { text } =
			typeof toast?.[0] == "object"
				? toast[0]
				: {
						text: [...toast].join(" "),
				  };

		Toast.show({
			text,
		});
	},
	readClipboard: async () => {
		try {
			return await Clipboard.read();
		} catch (error) {
			console.log("Error copying text: ", error);
			// throw "Failed to copy!";
		}
	},
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

			if (res) return res?.data;
		} catch (error) {
			//
		}
	},
	writeFile: async (props = {}, contents, { folder, open } = {}) => {
		console.log("Write file: ", folder, open);

		try {
			return await Filesystem.writeFile({
				path: props.path || props.name,
				data: contents,
				directory: Directory.Documents,
				encoding: Encoding.UTF8,
			});
		} catch (error) {
			//
		}
	},
	share: (payload) => Share.share(payload),
});

export default function MobileApp() {
	const handleShareIntent = async (result, fromOpen) => {
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
			alert("Share error: " + error);
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
		listenForOpen();

		return () => {
			window.removeEventListener(
				"sendIntentReceived",
				handleShareIntent,
				false
			);

			CapacitorApp.removeAllListeners();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className="pointer-events-none">
				<div
					className="dark:hidden bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(380px)",
						backgroundImage: `url(img/light-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="hidden dark:block bg-cover fixed inset-0 blur-xl"
					style={{
						"--tw-blur": "blur(150px)",
						backgroundImage: `url(img/dark-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="fixed bg-canvas/5 inset-x-0 top-0 backdrop-blur-sm"
					style={{
						"--tw-backdrop-blur": "blur(1px)",
						height: "env(safe-area-inset-top)",
					}}
				></div>
			</div>

			<div className="relative">
				<AppContent />
			</div>
		</>
	);
}

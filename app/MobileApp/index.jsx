import { useEffect } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { App as CapacitorApp } from "@capacitor/app";
import registerPlatformUtils from "@/crotchet/registerUtils";
import AppContent from "./AppContent";

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
	const handleShareIntent = async (result, fromOpen) => {};

	// eslint-disable-next-line no-unused-vars
	const listenForOpen = () => {
		CapacitorApp.addListener("appUrlOpen", async (event) => {});
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

import { useRef, useState } from "react";
import { useEventListener } from "@/crotchet/hooks";
import { dispatch, hideApp } from "@/crotchet/utils";
import AppContent from "./AppContent";
import registerPlatformUtils from "@/crotchet/registerUtils";
import ThemeBg from "@/DesktopApp/ThemeBg";
import { useAppContext } from "@/crotchet/providers/AppProvider";
import { onActionClick } from "@/crotchet/hooks/useActionClick";

registerPlatformUtils({
	showToast: (...toast) => {
		const { text } =
			typeof toast?.[0] == "object"
				? toast[0]
				: {
						text: [...toast].join(" "),
				  };

		window.desktop.showToast(text);
	},
	readClipboard: () => {},
	copyToClipboard: (content, message = "Copied") => {
		if (!content?.length) return console.log("Nothing to copy: ", content);

		window.socketEmit("copy", content);
		window.showToast(message);
	},
	getFile: ({ read } = {}) => {
		const key = "getFile" + window.randomId();

		return new Promise((res) => {
			var handler = async (e) => {
				window.removeEventListener(`get-file-${key}`, handler);
				return res(e.detail);
			};

			window.addEventListener(`get-file-${key}`, handler);

			dispatch("get-file", [
				key,
				{
					read,
				},
			]);
		});
	},
	readNetworkFile: (url, props = {}) => {
		const ref = `readNetworkFile${window.randomId()}`;
		return new Promise((res) => {
			const handler = async (e) => {
				window.removeEventListener(ref, handler);
				res(e.detail);
			};

			window.addEventListener(ref, handler);

			dispatch("read-network-file", [ref, { url, ...props }]);
		});
	},
	readFile: (props) => {
		const key = "readFile" + window.randomId();

		return new Promise((res) => {
			var handler = async (e) => {
				window.removeEventListener(`read-file-${key}`, handler);
				let contents = e.detail;

				if (contents?.length) {
					try {
						contents = JSON.parse(contents);
					} catch (_) {
						//
					}
				}

				res(contents);
			};

			window.addEventListener(`read-file-${key}`, handler);

			dispatch("read-file", { key, ...props });
		});
	},
	writeFile: (props = {}, contents, { folder, open } = {}) => {
		return dispatch("write-file", {
			name: props.name,
			path: props.path,
			contents,
			folder,
			open,
		});
	},
	share: () => {},
});

export default function DesktopApp() {
	const {
		appTheme: { ThemeStyles },
	} = useAppContext();
	const toastTimerRef = useRef();
	const [toast, setToast] = useState(null);

	window.desktop.showToast = (message) => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

		setToast(message);

		toastTimerRef.current = setTimeout(() => {
			setToast(null);
		}, 2000);
	};

	const hideAppWindow = () => {
		hideApp();
		window.desktop.visible = false;
	};

	const handleHideApp = () => {
		if (localStorage.openDevTools) return;
		if (document.body.className.indexOf("get-file-") != -1) return;
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);
		window.hideAppTimeout = setTimeout(hideAppWindow, 10);
	};

	useEventListener("focus", () => {
		window.desktop.visible = true;
		if (window.hideAppTimeout) clearTimeout(window.hideAppTimeout);

		document.body.className
			.split(" ")
			.filter((cls) => cls.startsWith("get-file"))
			.forEach((cls) => document.body.classList.remove(cls));
	});

	useEventListener("blur", () => {
		handleHideApp();
	});

	useEventListener("socket", (_, { event, payload = {} } = {}) => {
		// console.log("Socket event: ", event, payload);

		if (event == "run-action") {
			const { action, ...args } = payload;
			try {
				onActionClick(window.actions[action])(args.payload);
				return;
			} catch (error) {
				//
			}

			return;
		}

		if (event == "open-url") {
			console.log("Socket open url: ", payload);
			// try {
			// 	setTimeout(() => {
			// 		openUrl(payload);
			// 	}, 20);
			// } catch (error) {
			// 	//
			// }

			return;
		}

		if (event == "open-page") {
			// return dispatch("open-page", payload);
			console.log("Socket open page: ", payload);
			window.openPage({
				type: "detail",
				...(payload || {}),
			});
		}

		if (event == "remote-action") {
			// console.log("Socket remote action: ", payload);
			dispatch("remote-action-" + payload.pageId, payload);
		}
	});

	return (
		<div className="h-screen w-screen text-content pointer-events-auto">
			{/* <div className="relative bg-stone-100/95 dark:bg-card/95 backdrop-blur-sm size-full overflow-hidden"> */}
			<ThemeStyles />

			<div className="relative size-full overflow-hidden">
				<div className="border border-transparent dark:border-content/30 rounded-xl fixed inset-0 pointer-events-none z-50"></div>
				<ThemeBg className="relative size-full overflow-hidden">
					<AppContent />
				</ThemeBg>
			</div>

			{toast && (
				<div className="fixed inline-flex items-center bottom-14 h-7 px-3 z-[999999] bg-content/85 text-on-content text-xs drop-shadow-sm rounded-full -translate-x-1/2 left-1/2">
					{toast}
				</div>
			)}
		</div>
	);
}

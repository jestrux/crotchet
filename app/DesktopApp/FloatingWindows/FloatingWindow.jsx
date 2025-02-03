import { useEventListener } from "@/crotchet/hooks";
import { loadExternalAsset } from "@/crotchet/utils";
import { useLayoutEffect, useRef, useState } from "react";

export default function FloatingWindow({ page }) {
	const [initialized, setInitialized] = useState(false);
	const [content, setContent] = useState("");
	const [className, setClassName] = useState("");
	const elementRef = useRef();
	const remoteActionHandler = useRef();

	useLayoutEffect(() => {
		loadAssets().then(() => {
			window.socketEmit("floating-window-ready", {
				_id: page._id,
			});

			elementRef.current.setAttribute(
				"x-data",
				`{$page: ${JSON.stringify(page)}}`
			);

			window.Alpine.magic(
				"onRemoteAction",
				() => (callback) => (remoteActionHandler.current = callback)
			);
		});
	}, []);

	const loadAssets = async () => {
		return Promise.all(
			[
				...(page.externalAssets || []),
				{
					name: "AlpineJs",
					url: "https://unpkg.com/alpinejs@3.14.8/dist/cdn.min.js",
					type: "script",
				},
			].map((asset) => loadExternalAsset(asset.url || "asset", asset))
		);
	};

	useEventListener(
		"floating-window-event-" + page._id,
		(_, { action, ...payload }) => {
			if (action == "remote-action") {
				if (typeof remoteActionHandler.current == "function")
					remoteActionHandler.current(payload);
			}

			if (action == "set-content") {
				setInitialized(false);
				setContent(payload.content);
				setClassName(payload.className);

				setTimeout(() => {
					setInitialized(true);
				}, 10);
			}
		}
	);

	return (
		<div
			ref={elementRef}
			className={className}
			dangerouslySetInnerHTML={{ __html: initialized ? content : "" }}
		></div>
	);
}

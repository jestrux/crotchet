import { useEventListener } from "@/crotchet/hooks";
import { closeFloatingWindow, dispatch, loadExternalAsset } from "@/crotchet/utils";
import { useLayoutEffect, useRef, useState } from "react";
import { youtubePlayer } from "@/crotchet/providers/ui";

export default function FloatingWindow({ page }) {
	const [initialized, setInitialized] = useState(false);
	const [content, setContent] = useState("");
	const [className, setClassName] = useState("");
	const elementRef = useRef();
	const remoteActionHandler = useRef();

	const floatingData = page.floatingComponent || null;

	useLayoutEffect(() => {
		if (floatingData) {
			window.socketEmit("floating-window-ready", { _id: page._id });
			return;
		}

		loadAssets().then(() => {
			window.socketEmit("floating-window-ready", { _id: page._id });

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
			if (floatingData) {
				if (action === "remote-action")
					dispatch("remote-action-" + page._id, payload);
				return;
			}

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

	if (floatingData?.type === "youtubePlayer") {
		const onNavigate = (action) => {
			if (action === "restore") {
				closeFloatingWindow(page._id);
				window.socketEmit("run-action", {
					showWindow: true,
					action: "playYoutubeClip",
					payload: floatingData.id,
				});
			}
			if (action === "youtube") {
				closeFloatingWindow(page._id);
				window.socketEmit("open", floatingData.youtubeUrl);
			}
		};

		return youtubePlayer(
			{
				_id: floatingData.id,
				start: floatingData.start,
				end: floatingData.end,
				duration: floatingData.duration,
			},
			{ fullscreen: true, onNavigate, pageId: page._id }
		);
	}

	return (
		<div
			ref={elementRef}
			className={className}
			dangerouslySetInnerHTML={{ __html: initialized ? content : "" }}
		></div>
	);
}

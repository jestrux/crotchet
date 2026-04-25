import RegularListItem from "@/crotchet/components/ListItem";
import MediaItem from "../components/MediaItem";
import { useEventListener, useLongPress } from "../hooks";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageContext } from "./PageProvider";
import { isValidAction, loadExternalAsset, dispatch } from "../utils";
import clsx from "clsx";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import openUrl from "../open-url";
import PreviewWithMeta from "../components/PreviewWithMeta";
import { onActionClick } from "../hooks/useActionClick";

export function media({ data } = {}) {
	if (!data) return null;
	return <MediaItem {...data} />;
}

export function previewWithMeta({ data } = {}) {
	if (!data) return null;
	return <PreviewWithMeta {...data} />;
}

function Component({ data }) {
	const { page, pageData, isOpen } = usePageContext();
	const [initialized, setInitialized] = useState(false);
	const elementRef = useRef();
	const pageDataChangedHandler = useRef();
	const remoteActionHandler = useRef();

	useLayoutEffect(() => {
		elementRef.current.setAttribute(
			"x-data",
			`{
				$page: ${JSON.stringify(page)},
				$pageData: ${JSON.stringify(pageData || {})},
			}`
		);

		loadAssets().then(() => {
			window.Alpine.magic("onPageDataChanged", () => (callback) => {
				pageDataChangedHandler.current = callback;
			});

			window.Alpine.magic(
				"onRemoteAction",
				() => (callback) => (remoteActionHandler.current = callback)
			);

			elementRef.current.setAttribute(
				"x-data",
				`{
					$page: ${JSON.stringify(page)},
					$pageData: ${JSON.stringify(pageData || {})},
					init() {
						this.$onPageDataChanged((data) => {
							this.$pageData = data;
						});
					}
				}`
			);

			setTimeout(() => {
				setInitialized(true);

				if (data.onInit) {
					data.onInit({
						$el: elementRef.current,
					});
				}
			});
		});

		return () => {
			if (data.onDestroy) data.onDestroy();
		};
	}, []);

	const loadAssets = async () => {
		return Promise.all(
			[
				...(data?.externalAssets || []),
				{
					name: "AlpineJs",
					url: "https://unpkg.com/alpinejs@3.14.8/dist/cdn.min.js",
					type: "script",
				},
			].map((asset) => loadExternalAsset(asset.url || "asset", asset))
		);
	};

	useEventListener("page-data-changed-" + page?._id, (_, payload) => {
		if (!isOpen) return;
		if (data.onPageDataChanged) data.onPageDataChanged(payload);

		if (typeof pageDataChangedHandler.current == "function")
			pageDataChangedHandler.current(payload);
	});

	useEventListener("remote-action-" + page?._id, (_, payload) => {
		if (typeof remoteActionHandler.current == "function")
			remoteActionHandler.current(payload);
	});

	const content =
		typeof data.content == "function" ? data.content() : data.content;
	const className =
		typeof data.className == "function" ? data.className() : data.className;

	return (
		<div
			// eslint-disable-next-line react/no-unknown-property
			x-data="{}"
			ref={elementRef}
			className={className}
			dangerouslySetInnerHTML={{ __html: initialized ? content : "" }}
		></div>
	);
}

export const component = (data) => <Component data={data} />;

function YoutubePlayer({ id, start = 0, end, duration, fullscreen = false, showMeta = false, onNavigate }) {
	const { page, isOpen } = usePageContext();
	const playerRef = useRef(null);
	const cropRef = useRef([start, end ?? duration]);
	const cropEnabledRef = useRef(true);
	const currentTimeRef = useRef(0);

	const formatTime = (t) => Number(Number(t).toFixed(3));

	const restartVideo = () => {
		const [s] = cropRef.current.map(formatTime);
		playerRef.current?.seekTo(cropEnabledRef.current ? s : 0);
		playerRef.current?.playVideo();
	};

	const seekTo = (time, skipCheck = false) => {
		if (!skipCheck) {
			const [s, e] = cropRef.current.map(formatTime);
			if (time >= e || time >= (duration ?? Infinity) || time <= s) time = 0;
		}
		currentTimeRef.current = time;
		playerRef.current?.seekTo(time);
		playerRef.current?.playVideo();
	};

	useEffect(() => {
		const init = () => {
			playerRef.current = new window.YT.Player("youtube-player", {
				events: {
					onReady: () => { window.__player = playerRef.current; },
				},
			});
		};

		if (window.YT?.Player) {
			init();
		} else {
			window.onYouTubeIframeAPIReady = init;
			if (!document.querySelector("#yt-iframe-api-script")) {
				const script = document.createElement("script");
				script.id = "yt-iframe-api-script";
				script.src = "https://www.youtube.com/iframe_api";
				document.body.appendChild(script);
			}
		}
	}, []);

	useEffect(() => {
		const handleMessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event !== "infoDelivery" || !data.info?.currentTime) return;
				const time = formatTime(data.info.currentTime);
				currentTimeRef.current = time;
				const [s, e] = cropRef.current.map(formatTime);
				const [lo, hi] = cropEnabledRef.current ? [s, e] : [0, duration ?? Infinity];
				if (time < hi && time > lo) return;
				restartVideo();
			} catch {}
		};
		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	// Bridge remote controller actions into the youtube-clip-action channel
	useEventListener("remote-action-" + page?._id, (_, payload) => {
		if (!isOpen) return;
		dispatch("youtube-clip-action", payload);
	});

	// Handle all player and navigation actions
	useEventListener("youtube-clip-action", (_, payload) => {
		if (!isOpen) return;
		const action = payload?.action || payload?.id;
		if (action === "restart") restartVideo();
		else if (action === "skip-back") seekTo(currentTimeRef.current - 5);
		else if (action === "skip-forward") seekTo(currentTimeRef.current + 5);
		else if (action === "toggle-crop") {
			cropEnabledRef.current = !cropEnabledRef.current;
			restartVideo();
		} else if (onNavigate) onNavigate(action);
	});

	// Update crop when page data changes (e.g. editing a clip)
	useEventListener("page-data-changed-" + page?._id, (_, data) => {
		if (!isOpen || !data) return;
		const s = formatTime(data.start ?? data.crop?.[0] ?? 0);
		const e = formatTime(data.end ?? data.crop?.[1] ?? duration ?? 0);
		cropRef.current = [s, e];
		restartVideo();
	});

	const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&enablejsapi=1&controls=1&start=${Math.round(start)}`;

	if (fullscreen) {
		return (
			<div className="absolute inset-0 bg-black flex items-center justify-center">
				<iframe
					id="youtube-player"
					className="pointer-events-none size-full"
					src={src}
					allow="autoplay; encrypted-media"
					allowFullScreen
				/>
			</div>
		);
	}

	return (
		<div>
			<iframe
				id="youtube-player"
				className="w-full"
				style={{ aspectRatio: "16/9", pointerEvents: "none" }}
				src={src}
				allow="autoplay; encrypted-media"
				allowFullScreen
			/>
			{showMeta && (
				<div className="mt-2 divide-y">
					<div className="flex items-center justify-between gap-2 py-2 px-4">
						<span>Start</span>
						<span>{window.toHms?.(cropRef.current[0])}</span>
					</div>
					<div className="flex items-center justify-between gap-2 py-2 px-4">
						<span>End</span>
						<span>{window.toHms?.(cropRef.current[1])}</span>
					</div>
				</div>
			)}
		</div>
	);
}

const loadYoutubeVideo = (id) =>
	new Promise((resolve) => {
		const iframe = document.createElement("iframe");
		iframe.src = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1`;
		iframe.style.cssText =
			"position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
		document.body.appendChild(iframe);

		const init = () => {
			new window.YT.Player(iframe, {
				events: {
					onReady: (e) => {
						const player = e.target;
						const duration = player.getDuration();
						const title = player.getVideoData()?.title;
						player.destroy();
						iframe.remove();
						resolve({ duration, title });
					},
				},
			});
		};

		if (window.YT?.Player) {
			init();
		} else {
			window.onYouTubeIframeAPIReady = init;
			if (!document.querySelector("#yt-iframe-api-script")) {
				const script = document.createElement("script");
				script.id = "yt-iframe-api-script";
				script.src = "https://www.youtube.com/iframe_api";
				document.body.appendChild(script);
			}
		}
	});

export const youtubePlayer = (clip, options = {}) => {
	const id = clip._id || clip.id;
	const start = clip.start ?? clip.crop?.[0] ?? 0;
	const end = clip.end ?? clip.crop?.[1] ?? clip.duration;
	return <YoutubePlayer id={id} start={Number(start)} end={Number(end)} duration={clip.duration} {...options} />;
};

youtubePlayer.loadVideo = loadYoutubeVideo;

export function list({ data, entryActions, entryAction } = {}) {
	if (!data?.length) return null;
	return (
		<div className="pt-1.5 px-3 relative size-full">
			{data.map((item) => {
				item.actions = item.actions
					? item.actions
					: entryActions
					? entryActions(item)
					: [];

				item.onClick = isValidAction(item.action)
					? onActionClick(item.action)
					: typeof entryAction == "function"
					? () => entryAction(item)
					: null;

				return <RegularListItem key={item?._id} {...item} />;
			})}
		</div>
	);
}

const GridItem = ({ item }) => {
	const { image, video, title, subtitle, meta, actions, share } = item;
	const gestures = useLongPress(() => {
		if (!actions?.length && !share) return;

		Haptics.impact({ style: ImpactStyle.Medium });

		if (actions?.length) {
			return window.openActionSheet({
				fullScreen: true,
				preview: {
					image: image,
					video: video,
					title: title,
					subtitle: subtitle,
					actions: actions,
				},
				actions,
			});
		}

		if (share) openUrl(share);
	});

	const handleClick = () => {
		if (typeof item.handler == "function") item.handler();
		else if (item.url) openUrl(item.url);
	};

	return (
		<div
			key={item?._id}
			{...gestures}
			onDoubleClick={() => {}}
			onClick={() => handleClick()}
		>
			<div className="aspect-[2/1.45] border border-content/10 pointer-events-none rounded-md relative flex-shrink-0 overflow-hidden size-full flex items-center justify-center">
				<div
					className={clsx(
						"h-full relative bg-content/10 overflow-hidden",
						meta?.face
							? "aspect-[1/1] rounded-full"
							: "w-full rounded"
					)}
					style={{
						...(item.color
							? {
									backgroundColor: item.color,
									color: "white",
							  }
							: {}),
					}}
				>
					{(image?.length || video?.length) && (
						<>
							<img
								className={"absolute size-full object-cover"}
								src={image?.length ? image : video}
								alt=""
							/>
							{video?.length && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<svg
										className="ml-px size-4 relative text-white/90"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
										/>
									</svg>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export function grid({ data, entryActions, entryAction } = {}) {
	if (!data?.length) return null;
	return (
		<div className="py-3 px-3 relative ssize-full grid grid-cols-4 gap-2.5">
			{data.map((item) => {
				item.actions = item.actions
					? item.actions
					: entryActions
					? entryActions(item)
					: [];

				item.handler =
					typeof entryAction == "function"
						? () => entryAction(item)
						: null;

				return <GridItem key={item?._id} item={item} />;
			})}
		</div>
	);
}

const iconMap = {
	default: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
	ai: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
	bolt: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
	clear: "M6 18 18 6M6 6l12 12",
	restore: "M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3",
	check: "m4.5 12.75 6 6 9-13.5",
	close: "M6 18 18 6M6 6l12 12",
	copy: "M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z",
	edit: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
	delete: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
	more: "M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
	home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
	share: "M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z",
	shuffle:
		"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
	play: "M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z",
	image: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
	minus: "M5 12h14",
	substract: "M5 12h14",
	add: "M12 4.5v15m7.5-7.5h-15",
	"add-circle": "M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
	search: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
	sparkles:
		"M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
	user: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
	list: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
	data: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
	"open-external":
		"M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
};

export const icon = (icon, { size = "18px", ...props } = {}) =>
	svg(iconMap[icon] || iconMap.default, { size, ...props });

export function svg(
	path,
	{
		filled,
		size,
		boxSize = 24,
		strokeWidth = 1.8,
		color = "currentColor",
	} = {}
) {
	const fillStroke = filled
		? {
				fill: "currentColor",
		  }
		: {
				fill: "none",
				strokeWidth: strokeWidth,
				stroke: color,
		  };

	return (
		<svg
			{...(size ? { width: size, height: size } : {})}
			viewBox={`0 0 ${boxSize} ${boxSize}`}
			{...fillStroke}
		>
			{Array.isArray(path) ? (
				path.map((p, i) => (
					<path
						key={i}
						strokeLinecap="round"
						strokeLinejoin="round"
						d={p}
					/>
				))
			) : (
				<path strokeLinecap="round" strokeLinejoin="round" d={path} />
			)}
		</svg>
	);
}

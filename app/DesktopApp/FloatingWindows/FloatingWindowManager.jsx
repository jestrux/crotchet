import { useEventListener } from "@/crotchet/hooks";
import {
	extractHtmlFromComponent,
	hideApp,
	openRemotePageController,
	randomId,
} from "@/crotchet/utils";

export default function FloatingWindowManager() {
	const setupRemote = (page) => {
		const _id = page._id;
		const pageActions =
			typeof page.actions == "function"
				? page.actions({}, true)
				: page.actions || [];

		const actionNames = pageActions.reduce((agg, action) => {
			if (action.label && action.remote)
				agg.push({
					..._.pick(action, ["id", "label", "shortLabel", "shortcut"]),
					pageId: _id,
					icon: action.icon
						? extractHtmlFromComponent(action.icon)
						: null,
				});
			return agg;
		}, []);

		window.dispatch("socket-broadcast", {
			event: !actionNames.length
				? "remote-page-closed"
				: "remote-page-changed",
			payload: {
				page: {
					_id,
					floating: true,
					...(page.image || page.video
						? {
								preview: {
									image: page.image || page.video,
									video: page.video,
								},
						  }
						: {}),
					title: page.title,
					actions: actionNames,
				},
			},
		});

		if (actionNames.length) setTimeout(() => openRemotePageController(_id), 10);
	};

	window.openFloatingWindow = (page) => {
		hideApp();

		const pageId = page.id || randomId("floatingWindowPage");
		if (!window.floatingWindows) window.floatingWindows = {};

		window.floatingWindows[pageId] = { ...page, _id: pageId };

		window.socketEmit("open-floating-window", {
			_id: pageId,
			url: page.url,
			data: page.data,
			window: page.window,
		});

		// For URL-based windows, set up remote immediately (no init signal)
		if (page.url) setupRemote({ ...page, _id: pageId });
	};

	useEventListener("floating-window-action", (__, { _id, action }) => {
		if (action == "init") {
			const page = window.floatingWindows?.[_id];
			if (!page) return;

			const content =
				typeof page.content == "function"
					? page.content()
					: page.content;
			const className =
				typeof page.className == "function"
					? page.className()
					: page.className;

			window.socketEmit("floating-window-event", {
				_id,
				action: "set-content",
				content,
				className,
			});

			setTimeout(() => {
				setupRemote(page);
				setTimeout(() => {
					if (typeof page.onEvent == "function")
						page.onEvent("ready", page);
				}, 10);
			}, 10);
		}

		if (action == "close") {
			if (window.floatingWindows) delete window.floatingWindows[_id];
			window.dispatch("socket-broadcast", {
				event: "remote-page-closed",
				payload: { page: { _id } },
			});
		}
	});

	// Forward youtube-clip-action events to the floating YouTube window
	useEventListener("youtube-clip-action", (__, { action }) => {
		if (!window.floatingWindows?.floatingYoutubeClip) return;
		window.socketEmit("floating-window-event", {
			_id: "floatingYoutubeClip",
			action: "crotchet-action",
			data: { action },
		});
	});

	return null;
}

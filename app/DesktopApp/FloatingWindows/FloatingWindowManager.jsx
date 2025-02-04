import { useDataLoader, useEventListener } from "@/crotchet/hooks";
import {
	dispatch,
	extractHtmlFromComponent,
	hideApp,
	randomId,
} from "@/crotchet/utils";

export default function FloatingWindowManager() {
	useDataLoader({
		handler: async () => {
			return window.floatingWindows;
		},
		listenForUpdates: "floating-windows-updated",
	});

	window.openFloatingWindow = (page) => {
		hideApp();

		const pageId = page.id || randomId("floatingWindowPage");
		if (!window.floatingWindows) window.floatingWindows = {};

		window.floatingWindows[pageId] = {
			...page,
			_id: pageId,
		};

		dispatch("floating-windows-updated");

		window.socketEmit("open-floating-window", {
			_id: pageId,
			externalAssets: page.externalAssets,
			window: page.window,
		});
	};

	useEventListener("floating-window-action", (__, { _id, action }) => {
		if (action == "init") {
			const page = window.floatingWindows[_id];
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
				const actionNames = (page.actions || []).reduce(
					(agg, action) => {
						if (action.label && action.remote)
							agg.push({
								..._.pick(action, [
									"id",
									"label",
									"shortLabel",
									"shortcut",
								]),
								// ...action,
								pageId: _id,
								icon: action.icon
									? extractHtmlFromComponent(action.icon)
									: null,
							});
						return agg;
					},
					[]
				);

				const payload = {
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
				};

				window.dispatch("socket-broadcast", payload);

				setTimeout(() => {
					if (typeof page.onEvent == "function")
						page.onEvent("ready", page);
				}, 10);
			}, 10);
		}

		if (action == "close") {
			window.dispatch("socket-broadcast", {
				event: "remote-page-closed",
				payload: {
					page: {
						_id,
					},
				},
			});
		}
	});

	return null;
}

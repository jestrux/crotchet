import { useEffect } from "react";
import { useDataLoader, useEventListener } from "../../hooks";
import RemoteController from "./RemoteController";
import RemotePageController from "./RemoteController/RemotePageController";
import { dispatch } from "@/crotchet/utils";

export default function useRemote() {
	const { data: pages } = useDataLoader({
		handler: async () => {
			return window.remotePages;
		},
		listenForUpdates: "remote-updated",
	});

	const onAction = (action) => {
		window.socketEmit("emit", {
			event: "remote-action",
			payload: action,
		});
	};

	const openController = () => {
		window.openActionSheet({
			title: "Remote Controller",
			content: <RemoteController />,
		});
	};

	const openPage = (page, { fromMainRemote } = {}) => {
		window.activeRemotePageController = page._id;

		window
			.openActionSheet({
				title: page.title,
				content: <RemotePageController page={page} />,
			})
			.then(() => {
				window.activeRemotePageController = null;

				if (fromMainRemote) {
					setTimeout(() => {
						if (window.remotePages?.length) openController();
					}, 20);
				}
			});
	};

	useEventListener("open-remote-controller", openController);

	useEventListener("open-remote-page-controller", (_, pageId) => {
		const page = (pages || []).find(({ _id }) => _id == pageId);
		if (window.activeRemotePageController == pageId)
			dispatch("close-remote-page-controller-" + pageId);

		if (page) openPage(page);
	});

	useEffect(() => {
		if (!pages || !window.activeRemotePageController) return;
		const activePageId = window.activeRemotePageController;
		const activePage = pages.find((p) => p._id == activePageId);
		if (!activePage)
			dispatch("close-remote-page-controller-" + activePageId);
	}, [pages]);

	return {
		pages,
		onAction,
		openController,
		openPage,
		currentPage: pages?.at(-1),
	};
}

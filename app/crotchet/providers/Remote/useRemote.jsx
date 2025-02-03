import { useDataLoader, useEventListener } from "../../hooks";
import RemoteController from "./RemoteController";
import RemotePageController from "./RemoteController/RemotePageController";

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
		window
			.openActionSheet({
				title: page.title,
				content: <RemotePageController page={page} />,
			})
			.then(() => {
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
		if (page) openPage(page);
	});

	return {
		pages,
		onAction,
		openController,
		openPage,
		currentPage: pages?.at(-1),
	};
}

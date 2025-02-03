import { useDataLoader } from "@/crotchet/hooks";
import { dispatch } from "@/crotchet/utils";
import { useEffect } from "react";

export default function RemoteConnect() {
	const { data: socketConnected } = useDataLoader({
		handler: async () => window.socket?.connected,
		listenForUpdates: ["socket-connected", "socket-disconnected"],
	});

	const canUpdate = (page) => {
		if (!window.remotePages || !socketConnected) {
			window.remotePages = [];
			dispatch("remote-updated");
		}

		return socketConnected && page?._id;
	};

	const handleRemotePageChanged = ({ page } = {}) => {
		if (!canUpdate(page)) return;

		const existingIndex = window.remotePages.findIndex(
			(p) => p._id == page._id
		);

		if (existingIndex != -1)
			window.remotePages.splice(existingIndex, 1, page);
		else window.remotePages.push(page);

		dispatch("remote-updated");
	};

	const handleRemotePageClosed = ({ page } = {}) => {
		if (!canUpdate(page)) return;

		window.remotePages = window.remotePages.filter(
			(p) => p._id != page._id
		);

		dispatch("remote-updated");
	};

	const handleOpenRemotePageController = (payload) => {
		dispatch("open-remote-page-controller", payload);
	};

	useEffect(() => {
		canUpdate();

		window.socket?.on("remote-page-changed", handleRemotePageChanged);
		window.socket?.on("remote-page-closed", handleRemotePageClosed);
		window.socket?.on(
			"open-remote-page-controller",
			handleOpenRemotePageController
		);

		return () => {
			window.socket?.off("remote-page-changed", handleRemotePageChanged);
			window.socket?.off("remote-page-closed", handleRemotePageClosed);
			window.socket?.off(
				"open-remote-page-controller",
				handleOpenRemotePageController
			);
		};
	}, [socketConnected]);

	return null;
}

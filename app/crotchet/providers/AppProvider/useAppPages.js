import { useEventListener, useKeyDetector, useOnInit } from "@/crotchet/hooks";
import {
	camelCaseToSentenceCase,
	dispatch,
	onDesktop,
	randomId,
} from "@/crotchet/utils";
import { useState } from "react";

export default function useAppPages() {
	const [pages, setPages] = useState([]);

	const getNewPage = (page) => {
		let pageResolver;
		const promise = new Promise((resolve) => {
			pageResolver = resolve;
		});
		const id = randomId();

		if (page.source) {
			const { q, query, source, ...otherPageProps } = page;
			const actualSource = source?._id
				? source
				: window.dataSources[source];

			if (!actualSource)
				return window.showToast(`Invalid data source ${source}`);

			page = {
				...otherPageProps,
				layoutProps: actualSource.layoutProps,
				type: "search",
				placeholder: actualSource.name
					? `Search ${camelCaseToSentenceCase(actualSource.name)}...`
					: "",
				searchQuery: q ?? query,
				resolve: actualSource.get,
				onDataChange: source.listenForUpdates,
				secondaryAction: actualSource.entrySecondaryAction,
				entryAction: actualSource.entryAction,
				entryActions: actualSource.entryActions,
			};
		}

		return [
			{
				...page,
				resolver: pageResolver,
				type: page.type || "search",
				id,
				_id: id,
			},
			promise,
		];
	};

	const pushPage = (page) => {
		const [newPage, resolver] = getNewPage(page);

		if (page.external) return window.openFloatingWindow(page);

		dispatch("with-loader-status-change", {
			status: "idle",
		});

		setPages((pages) => [...pages, newPage]);

		dispatch(`blur-${window.currentPageId}`);

		window.currentPageId = newPage._id;

		setTimeout(() => {
			dispatch(`open-${window.currentPageId}`);
		}, 200);

		return resolver;
	};

	useEventListener("open-page", (_, payload) => pushPage(payload));

	useEventListener("close-page", (_, data) =>
		popPage(pages.at(-1)?._id, data)
	);

	window.closePage = (data) => {
		if (!onDesktop()) return window.hideAlert();

		popPage(pages.at(-1)?._id, data);
	};

	// window.openPage = (page) => dispatch("open-page", page);
	window.openPage = (page) => {
		if (!onDesktop()) {
			return window.showAlert({
				...(page || {}),
				type: page?.type == "form" ? "form" : "page",
				fullScreen: true,
			});
		}

		return pushPage(page);
	};

	// window.openPage = (page) => pushPage(page);
	window.openForm = (page) => window.openPage({ ...page, type: "form" });

	const notifyRemoteOnPageClose = (pageId) => {
		if (onDesktop()) {
			dispatch("socket-broadcast", {
				event: "remote-page-closed",
				payload: {
					page: {
						_id: pageId,
					},
				},
			});
		}
	};

	const popPage = (pageId, data) => {
		const page = pages.find(({ _id }) => _id == pageId);

		if (typeof page?.resolver == "function") page.resolver(data);

		notifyRemoteOnPageClose(pageId);

		setPages((pages) => {
			const newPages = pages.filter((p) => p.id != pageId);

			window.currentPageId = newPages.at(-1)?.id || "root";
			dispatch(`open-${newPages.at(-1)?.id || "root"}`);

			return newPages;
		});
	};

	const getCurrentPageId = () => window.currentPageId ?? "root";

	useEventListener("click", () => dispatch(`click-${getCurrentPageId()}`));

	useEventListener("filter-changed", (_, payload) =>
		dispatch(`filter-changed-${getCurrentPageId()}`, payload)
	);

	useEventListener("change-filter", (_, payload) =>
		dispatch(`change-filter-${getCurrentPageId()}`, payload)
	);

	useEventListener("menu-closed", (_, payload) =>
		dispatch(`menu-closed-${getCurrentPageId()}`, payload)
	);

	useEventListener("alert-closed", (_, payload) =>
		dispatch(`alert-closed-${getCurrentPageId()}`, payload)
	);

	useEventListener("with-loader-status-change", (_, payload) =>
		dispatch(`status-change-${getCurrentPageId()}`, payload)
	);

	useKeyDetector({
		key: "Escape",
		action: (e) =>
			dispatch(`escape-${getCurrentPageId()}`, {
				popAll: e.shiftKey,
			}),
	});

	useKeyDetector({
		key: "Enter",
		action: () => dispatch(`enter-click-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "Cmd + Enter",
		action: () => dispatch(`cmd-enter-click-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "Cmd + t",
		action: () => dispatch(`secondary-action-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "Cmd + k",
		action: () => dispatch(`action-menu-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "Cmd + p",
		action: () => dispatch(`change-filter-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "ArrowDown",
		action: () => dispatch(`navigate-down-${getCurrentPageId()}`),
	});

	useKeyDetector({
		key: "ArrowUp",
		action: () => dispatch(`navigate-up-${getCurrentPageId()}`),
	});

	useOnInit(() => {
		setTimeout(() => dispatch("open-root"), 300);
	});

	return {
		pages,
		pushPage,
		popPage,
		popToRoot: () => {
			setPages((pages) => {
				if (onDesktop())
					pages.forEach((page) => notifyRemoteOnPageClose(page._id));

				return [];
			});
			dispatch("open-root");
			window.currentPageId = "root";
		},
	};
}

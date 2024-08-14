import { createContext, useContext, useRef, useState } from "react";
import { camelCaseToSentenceCase, dispatch, randomId } from "@/crotchet/utils";
import { useEventListener, useKeyDetector, useOnInit } from "@/crotchet/hooks";
import PageProvider from "./PageProvider";
import clsx from "clsx";

export const NavRootContext = createContext({
	rootPage: {},
	pages: [],
	/* eslint-disable no-unused-vars */
	pushPage: (page) => {},
	/* eslint-disable no-unused-vars */
	popPage: (pageId, data) => {},
	popToRoot: () => {},
});

export function useNavRootContext() {
	return useContext(NavRootContext);
}

export default function NavRootProvider({
	isOpen = false,
	rootPage: _rootPage = {},
	onClose,
	scaffold,
}) {
	const currentIdRef = useRef("root");
	const [rootPage] = useState(() => {
		return {
			..._rootPage,
			id: "root",
			_id: "root",
		};
	});
	const [pages, setPages] = useState([]);

	const getCurrentPageId = () => currentIdRef.current ?? "root";
	const setCurrentPageId = (id) => (currentIdRef.current = id || "root");

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

		setPages([...pages, newPage]);

		setCurrentPageId(newPage._id);

		setTimeout(() => {
			dispatch(`open-${getCurrentPageId()}`);
		}, 200);

		return resolver;
	};

	useEventListener("open-page", (_, payload) => pushPage(payload));

	useEventListener("close-page", (_, data) =>
		popPage(pages.at(-1)?._id, data)
	);

	// window.openPage = (page) => pushPage(page);

	// window.openForm = (page) => pushPage({ ...page, type: "form" });

	const popPage = (pageId, data) => {
		const page = pages.filter(({ _id }) => _id == pageId);

		if (typeof page.resolver == "function") page.resolver(data);

		setPages(() => {
			const newPages = pages.filter((p) => p.id != pageId);

			setCurrentPageId(newPages.at(-1)?.id);
			dispatch(`open-${newPages.at(-1)?.id || "root"}`);

			return newPages;
		});
	};

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

	const value = {
		pages,
		pushPage,
		popPage,
		popToRoot: () => {
			setPages([]);
			dispatch("open-root");
			setCurrentPageId("root");
		},
	};

	return (
		<div
			{...(isOpen ? { "data-current-nav-root": true } : {})}
			className={clsx({
				hidden: !isOpen,
			})}
		>
			<NavRootContext.Provider value={value}>
				<PageProvider
					scaffold={scaffold}
					page={rootPage}
					isOpen={!pages.length}
					onClose={onClose}
				/>

				{pages.map((page) => (
					<PageProvider
						key={page.id}
						isOpen={page.id == pages.at(-1).id}
						onClose={(data) => popPage(page.id, data)}
						page={page}
					>
						{page.content}
					</PageProvider>
				))}
			</NavRootContext.Provider>
		</div>
	);
}

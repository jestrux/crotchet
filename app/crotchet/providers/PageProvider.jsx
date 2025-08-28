import { createContext, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useDataLoader, useEventListener } from "@/crotchet/hooks";
import {
	randomId,
	sectionedChoices,
	loadExternalAsset,
} from "@/crotchet/utils";
import { sourceGet } from "../hooks/useSourceGet";

const PageContext = createContext({
	isOpen: false,
	page: null,
	pageResolving: false,
	pageStatus: {
		status: "idle",
		message: null,
	},
	pageData: null,
	setPageData: () => {},
	formData: null,
	setFormData: () => {},
	fullScreen: false,
	title: null,
	content: null,
	// content: () => {},
	preview: null,
	// preview: () => {},
	setPreview: () => {},
	pageFilter: null,
	setPageFilter: () => {},
	filters: () => {},
	formFields: () => {},
	mainAction: () => {},
	setMainAction: () => {},
	secondaryAction: () => {},
	setSecondaryAction: () => {},
	actions: null,
	setActions: () => {},
	onOpen: () => {},
	onCommandMatched: () => {},
	onBlur: () => {},
	onClose: () => {},
	onPopToRoot: () => {},
	onReady: () => {},
	onDataUpdated: () => {},
	onEscape: () => {},
	onClick: () => {},
	onMainActionClick: () => {},
	onOpenActionMenu: () => {},
	onSearch: null,
	onChangeFilter: () => {},
	onFilterChanged: () => {},
	onSecondaryActionClick: () => {},
	onNavigateLeft: () => {},
	onNavigateRight: () => {},
	onNavigateDown: () => {},
	onNavigateUp: () => {},
	contextInfo: {},
});

export function usePageContext() {
	return useContext(PageContext);
}

export default function PageProvider({
	isOpen,
	page,
	children,
	onClose = () => {},
	onPopToRoot = () => {},
}) {
	const alertsRef = useRef(window.alerts || []);
	const pageStatusResetTimeoutRef = useRef(null);
	const pageWrapperRef = useRef(null);
	const [pageDataVersion, setPageDataVersion] = useState(
		"data-" + randomId()
	);
	const [preview, setPreview] = useState();
	const [formData, setFormData] = useState(null);
	const filterRef = useRef(page?.filter?.defaultValue);
	const [pageFilter, _setPageFilter] = useState(filterRef.current);

	const [pageData, setPageData] = useState();
	const [pageStatus, _setPageStatus] = useState({ status: "idle" });
	const [mainAction, setMainAction] = useState();
	const [secondaryAction, setSecondaryAction] = useState();
	const [actions, setActions] = useState();

	const clickHandler = useRef(() => {});
	const onClick = (callback) => (clickHandler.current = callback);
	const mainActionClickHandler = useRef(() => {});
	const onMainActionClick = (callback) =>
		(mainActionClickHandler.current = callback);
	const secondaryActionClickHandler = useRef(() => {});
	const onSecondaryActionClick = (callback) =>
		(secondaryActionClickHandler.current = callback);
	const actionMenuClickHandler = useRef(() => {});
	const onOpenActionMenu = (callback) =>
		(actionMenuClickHandler.current = callback);
	const filterChangedHandler = useRef(() => {});
	const onFilterChanged = (callback) =>
		(filterChangedHandler.current = callback);
	const onChangeFilterHandler = useRef(() => {});
	const onChangeFilter = (callback) =>
		(onChangeFilterHandler.current = callback);
	const dataUpdatedHandler = useRef(() => {});
	const onDataUpdated = (callback) => (dataUpdatedHandler.current = callback);
	const readyHandler = useRef(() => {});
	const onReady = (callback) => (readyHandler.current = callback);
	const escapeHandler = useRef((payload) => onClose(payload));
	const onEscape = (callback) => (escapeHandler.current = callback);

	const openHandler = useRef(() => {});
	const onOpen = (callback) => (openHandler.current = callback);

	const commandMatchedHandler = useRef(() => {});
	const onCommandMatched = (callback) =>
		(commandMatchedHandler.current = callback);

	const blurHandler = useRef(() => {});
	const onBlur = (callback) => (blurHandler.current = callback);

	const navigateDownHandler = useRef(() => {});
	const onNavigateDown = (callback) => {
		navigateDownHandler.current = callback;
	};
	const navigateUpHandler = useRef(() => {});
	const onNavigateUp = (callback) => (navigateUpHandler.current = callback);
	const navigateLeftHandler = useRef(() => {});
	const onNavigateLeft = (callback) =>
		(navigateLeftHandler.current = callback);
	const navigateRightHandler = useRef(() => {});
	const onNavigateRight = (callback) =>
		(navigateRightHandler.current = callback);

	const [loadingFromSearch, setLoadingFromSearch] = useState(false);
	const { refetch, loading } = useDataLoader({
		handler: async () => {
			const filter = filterRef.current;
			// await someTime(5);
			await Promise.all(
				[
					{
						name: "AlpineJs",
						url: "https://unpkg.com/alpinejs@3.14.8/dist/cdn.min.js",
						type: "script",
						defer: true,
					},
					...(page?.externalAssets || []),
				].map((asset) =>
					loadExternalAsset(asset.url, {
						name: asset.name,
						type: asset.type,
						defer: asset.defer,
					})
				)
			);
			if (!page?.resolve) return true;

			return sourceGet(page.resolve, {
				filters: page?.filter?.field
					? { [page.filter.field]: filter }
					: null,
			});
		},
		listenForUpdates: page.listenForUpdates,
		dismiss: onClose,
		onSuccess: (data) => {
			setPageData(data);
			setTimeout(() => readyHandler.current(data));
		},
		onUpdate: (data, oldData) => {
			setPageDataVersion("data-" + randomId());
			setPageData(data);
			setTimeout(() => dataUpdatedHandler.current(data, oldData));
		},
	});

	const setPageStatus = (payload) => {
		if (pageStatusResetTimeoutRef.current)
			clearTimeout(pageStatusResetTimeoutRef.current);

		if (["success", "error"].includes(payload?.status)) {
			pageStatusResetTimeoutRef.current = setTimeout(() => {
				_setPageStatus({ status: "idle" });
			}, 3000);
		}

		_setPageStatus(payload);
	};

	const hasClass = (cls) => {
		const pageWrapper = pageWrapperRef.current;
		return pageWrapper?.className.indexOf(cls) != -1;
	};

	const pageInFocus = (callback) => {
		return (...args) => {
			if (!isOpen) return;

			if (alertsRef.current.length) return;

			if (hasClass("menu-open-") || hasClass("alert-open-")) return;

			callback(...args);
		};
	};

	useEffect(() => {
		let clearDataChangeWatcher;

		if (
			typeof page?.onDataChange == "function" &&
			typeof page?.resolve == "function"
		) {
			clearDataChangeWatcher = page?.onDataChange(() =>
				page.resolve().then((data) => {
					console.log("New data:", data);
				})
			);
		}

		return () => {
			if (typeof clearDataChangeWatcher == "function")
				clearDataChangeWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page?.onDataChange]);

	useEventListener("click-" + page?._id, pageInFocus(clickHandler.current));

	useEventListener("open-" + page?._id, openHandler.current);

	useEventListener("blur-" + page?._id, blurHandler.current);

	useEventListener(
		"command-matched-" + page?._id,
		commandMatchedHandler.current
	);

	useEventListener(
		"escape-" + page?._id,
		pageInFocus((_, payload) => {
			if (["error", "success"].includes(pageStatus?.status))
				setPageStatus({ status: "idle" });

			if (payload?.popAll) return onPopToRoot();

			escapeHandler.current();
		})
	);

	useEventListener(
		"menu-closed-" + page?._id,
		pageInFocus(openHandler.current)
	);

	useEventListener("alerts-changed", () => {
		setTimeout(() => {
			alertsRef.current = window.alerts;
		}, 200);
	});

	useEventListener(
		"alert-closed-" + page?._id,
		pageInFocus(openHandler.current)
	);

	useEventListener(
		"change-filter-" + page?._id,
		pageInFocus(onChangeFilterHandler.current)
	);

	useEventListener(
		"filter-changed-" + page?._id,
		pageInFocus(filterChangedHandler.current)
	);

	useEventListener(
		"action-menu-" + page?._id,
		actionMenuClickHandler.current
	);

	useEventListener(
		"secondary-action-" + page?._id,
		pageInFocus(secondaryActionClickHandler.current)
	);

	useEventListener(
		"enter-click-" + page?._id,
		pageInFocus(() => {
			if (page.type != "form") mainActionClickHandler.current();
		})
	);

	useEventListener(
		"cmd-enter-click-" + page?._id,
		pageInFocus(() => {
			if (page.type == "form") mainActionClickHandler.current();
		})
	);

	useEventListener(
		"navigate-left-" + page?._id,
		pageInFocus(navigateLeftHandler.current)
	);

	useEventListener(
		"navigate-right-" + page?._id,
		pageInFocus(navigateRightHandler.current)
	);

	useEventListener(
		"navigate-down-" + page?._id,
		pageInFocus(navigateDownHandler.current)
	);

	useEventListener(
		"navigate-up-" + page?._id,
		pageInFocus(navigateUpHandler.current)
	);

	useEventListener("status-change-" + page?._id, (_, payload) =>
		setPageStatus(payload)
	);

	const contextInfo = {
		page,
		pageData,
		pageDataVersion,
		formData,
		pageFilter,
		closePage: (payload) => onClose(payload),
		popToRoot: onPopToRoot,
	};

	return (
		<div
			ref={pageWrapperRef}
			id="pageWrapper"
			{...(isOpen ? { "data-current-page": true } : {})}
			className={clsx("fixed inset-0", {
				"opacity-0 pointer-events-none": !isOpen,
			})}
		>
			<PageContext.Provider
				value={{
					isOpen,
					page,
					pageData,
					pageDataVersion,
					setPageData,
					formData,
					setFormData,
					pageResolving: loading || loadingFromSearch,
					pageStatus,
					onOpen,
					onBlur,
					onClose,
					onPopToRoot,
					onCommandMatched,
					onReady,
					onDataUpdated,
					onEscape,
					get fullScreen() {
						return page?.fullScreen ?? false;
					},
					get title() {
						const title = page?.title;
						return typeof title == "function"
							? title(contextInfo)
							: title;
					},
					get content() {
						const content = page?.content;
						return typeof content == "function"
							? content(contextInfo)
							: content;
					},
					get preview() {
						let pagePreview = preview || page?.preview;
						return typeof pagePreview == "function"
							? pagePreview(contextInfo)
							: pagePreview;
					},
					setPreview,
					pageFilter,
					setPageFilter: (filter) => {
						filterRef.current = filter;
						_setPageFilter(filter);
						refetch();
					},
					filters: () => {
						const filters = page?.filters;
						return typeof filters == "function"
							? filters(contextInfo)
							: filters;
					},
					formFields: () => {
						let fields = page?.fields;
						fields =
							typeof fields == "function"
								? fields(contextInfo)
								: fields;
						let field = page?.field;
						field =
							typeof field == "function"
								? field(contextInfo)
								: field;

						return fields
							? fields
							: field
							? { formField: field }
							: {};
					},
					mainAction: () => {
						let action = mainAction || page?.action;
						action =
							typeof action == "function"
								? action(contextInfo)
								: action;

						return action
							? {
									...action,
									shortcut:
										page.type == "form"
											? "Cmd + Enter"
											: "Enter",
							  }
							: null;
					},
					setMainAction,
					secondaryAction: () => {
						let action = secondaryAction || page?.secondaryAction;
						action =
							typeof action == "function"
								? action(contextInfo)
								: action;

						return action
							? {
									...action,
									shortcut: "Cmd + T",
							  }
							: null;
					},
					setSecondaryAction,
					get actions() {
						const pageActions = actions || page?.actions;
						const appActions = page?.appActions;

						return [
							...((typeof pageActions == "function"
								? pageActions(contextInfo)
								: pageActions) || []),
							...((typeof appActions == "function"
								? appActions(contextInfo)
								: appActions) || []),
						];
					},
					setActions,
					onClick,
					onOpenActionMenu,
					onSearch: async (query) => {
						let searchResults = [];

						if (page?.onSearch) {
							setLoadingFromSearch(true);
							const results = await page?.onSearch(query);
							setLoadingFromSearch(false);
							searchResults = results;
						} else {
							searchResults = sectionedChoices(
								pageData || [],
								query,
								{
									valuesOnly: true,
								}
							);
						}

						if (
							!searchResults.length &&
							page?.fallbackSearchResults
						) {
							searchResults = (
								page.fallbackSearchResults(query) || []
							).map((result) => ({
								...result,
								section: `Use "${query}" with...`,
							}));
						}

						return searchResults;
					},
					onChangeFilter,
					onFilterChanged,
					onSecondaryActionClick,
					onMainActionClick,
					onNavigateDown,
					onNavigateUp,
					onNavigateLeft,
					onNavigateRight,
					get contextInfo() {
						return contextInfo;
					},
				}}
			>
				{children}
			</PageContext.Provider>
		</div>
	);
}

import { createContext, useContext, useEffect, useState } from "react";
import {
	camelCaseToSentenceCase,
	devMode,
	dispatch,
	getPreference,
	randomId,
	savePreference,
	someTime,
} from "@/crotchet/utils";
import {
	useDataLoader,
	useEventListener,
	useKeyDetector,
	useOnInit,
} from "@/crotchet/hooks";
import { AlertsWrapper } from "@/crotchet/hooks/useAlerts";
import { tinyColor } from "./color";

export const AppContext = createContext({
	pages: [],
	/* eslint-disable no-unused-vars */
	pushPage: (page) => {},
	/* eslint-disable no-unused-vars */
	popPage: (pageId, data) => {},
	popToRoot: () => {},
});

export function useAppContext() {
	return useContext(AppContext);
}

export function useCrotchetApp() {
	const [data, setData] = useState(null);
	const defaultApp = {
		name: "Crotchet",
		colors: {
			primary: "#84cc16",
			primaryDark: "#a3e635",
		},
	};

	var loader = useDataLoader({
		handler: async () => {
			await savePreference("__crotchetApp", null);

			const defaultApp = {
				name: "iPF OS",
				colors: {
					primary: "#1F79E4",
					primaryDark: "#4680d5",
				},
				homePage: "ipfHome",
			};

			// const app = await getPreference("__crotchetApp", defaultApp);
			const app = _.cloneDeep({
				name: "SetHero",
				colors: {
					primary: "#003376",
					primaryDark: "#4680d5",
				},
				// homePage: devMode() ? "setHeroLocal" : "setHeroHome",
				homePage: "setHeroHome",
			});

			if (!window.extensionsSet) {
				const event = "extensions-updated";
				await new Promise((resolve) => {
					const handler = async () => {
						window.removeEventListener(event, handler);
						resolve();
					};

					window.addEventListener(event, handler);
				});
			}

			if (app.homePage) {
				app.homePageName = _.clone(app).homePage;

				if (!window.pages?.[app.homePage]) {
					const event = "page-registered-" + app.homePage;
					await new Promise((resolve) => {
						const handler = async () => {
							window.removeEventListener(event, handler);
							resolve();
						};

						window.addEventListener(event, handler);
					});
				}

				app.homePage = window.pages?.[app.homePage];
			}

			return app;
		},
		onSuccess: setData,
		listenForUpdates: "crotchet-app-updated",
	});

	const handler = async () => {
		await someTime();
		setData((data) => ({
			...data,
			homePage: window.pages?.[data.homePageName],
		}));
	};

	useEffect(() => {
		let clearWatcher;

		if (data?.homePageName) {
			const event = `page-registered-${data.homePageName}`;
			window.addEventListener(event, handler);
			clearWatcher = () => window.removeEventListener(event, handler);
		}

		return () => {
			if (typeof clearWatcher == "function") clearWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.homePageName]);

	return { ...loader, data };
}

export default function AppProvider({ children }) {
	const { data: crotchetApp, loading } = useCrotchetApp();
	const [pages, setPages] = useState([]);
	const getCurrentPageId = () => window.currentPageId ?? "root";
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

	// window.openPage = (page) => pushPage(page);

	// window.openForm = (page) => pushPage({ ...page, type: "form" });

	const popPage = (pageId, data) => {
		const page = pages.filter(({ _id }) => _id == pageId);

		if (typeof page.resolver == "function") page.resolver(data);

		setPages(() => {
			const newPages = pages.filter((p) => p.id != pageId);

			window.currentPageId = newPages.at(-1)?.id || "root";
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
			window.currentPageId = "root";
		},
	};

	const setColors = (loading, crotchetApp) => {
		if (loading || !crotchetApp) return null;

		const primaryColor = tinyColor(crotchetApp.colors.primary);
		const primaryDarkColor = tinyColor(
			crotchetApp.colors.primaryDark || crotchetApp.colors.primary
		);
		const rgb = Object.values(primaryColor.toRgb()).slice(0, 3);
		const isLight = primaryColor.isLight();

		return (
			<style>
				{
					/*css*/ `
						:root {
							--primary-color: ${rgb.join(" ")};
							--on-primary-color: ${isLight ? "0 0 0" : "255 255 255"};
							--on-primary-inverted-color: ${isLight ? "255 255 255" : "0 0 0"};
							--ion-color-primary: rgb(var(--primary-color));
							--ion-color-primary-contrast: rgb(var(--on-primary-color));
						}

						body.dark {
							--primary-color: ${Object.values(primaryDarkColor.toRgb())
								.slice(0, 3)
								.join(" ")};
							--on-primary-color: ${primaryDarkColor.isLight() ? "0 0 0" : "255 255 255"};
						}

						@media (prefers-color-scheme: dark) {
							:root {
								--primary-color: ${Object.values(primaryDarkColor.toRgb())
									.slice(0, 3)
									.join(" ")};
								--on-primary-color: ${primaryDarkColor.isLight() ? "0 0 0" : "255 255 255"};
							}
						}
					`
				}
			</style>
		);
	};

	return (
		<AppContext.Provider value={value}>
			{setColors(loading, crotchetApp)}

			{children}

			<AlertsWrapper />
		</AppContext.Provider>
	);
}

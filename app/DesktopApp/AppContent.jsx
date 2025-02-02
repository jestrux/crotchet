// import DraggableElement from "@/crotchet/components/DraggableElement";
import Page from "./Page";
import {
	hideApp,
	dispatch,
	getPreference,
	savePreference,
} from "@/crotchet/utils";
import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader } from "@/crotchet/hooks";
import FloatingWindow from "./FloatingWindow";

const getFavoriteCommands = () => getPreference("favorite-commands", []);

const toggleCommandInFavorites = async (command, status) => {
	const favorites = await getFavoriteCommands();
	const newStatus = status ?? !favorites.includes(command);

	await savePreference(
		"favorite-commands",
		newStatus
			? [...favorites, command]
			: favorites.filter((c) => c != command)
	);

	dispatch("app-commands-updated");

	return newStatus;
};

const commandProps = (item, section, favorites) => {
	const faved = favorites.includes(item.name);
	const props = {
		section: faved ? "Favorites" : section,
		pinned: favorites.indexOf(item.name),
		actions: (...payload) => [
			...(typeof item.actions == "function"
				? item.actions(...payload)
				: item.actions
				? item.actions
				: []),
			{
				shortcut: "Shift + Option + F",
				label: faved ? "Remove from favorites" : "Add to favorites",
				handler: () => {
					window.withLoader(
						() => toggleCommandInFavorites(item.name),
						{
							successMessage: (status) =>
								`${item.label} ${
									status
										? "added to favorites"
										: "removed from favorites"
								}`,
						}
					);
				},
			},
			{
				label: "Move to top",
				shortcut: "Shift + Option + T",
				handler: () => {
					window.withLoader(
						async () => {
							await toggleCommandInFavorites(item.name, false);
							await toggleCommandInFavorites(item.name, true);
						},
						{
							successMessage: `${item.label} moved to top`,
						}
					);
				},
			},
		],
	};

	return props;
};

const getCommands = async () => {
	const favorites = await getFavoriteCommands();
	const getAutomationsAction = {
		name: "getAutomations",
		label: "Run an Automation",
		trailing: "Action",
		action: {
			label: "Select action",
			handler: () =>
				dispatch("open-page", {
					type: "search",
					resolve: window.actions.getAutomations.handler,
				}),
		},
	};

	return [
		..._.concat(getAutomationsAction, window.globalActions()).map(
			(action) => ({
				name: action.name,
				label: action.label,
				value: action.label,
				trailing: "Action",
				action: {
					label: "Select action",
					handler: action.handler,
				},
				...commandProps(action, "Actions", favorites),
			})
		),
		..._.sortBy(
			_.filter(
				Object.values(window.dataSources),
				({ searchable }) => !searchable
			),
			"label"
		).map((source) => ({
			name: source.name,
			label: source.label,
			value: source.label,
			trailing: "Data Source",
			action: {
				label: "View Data Source",
				handler: () =>
					dispatch("open-page", {
						type: "search",
						source: source.name,
						filter: source.filter,
						filters: source.filters,
						listenForUpdates: source.listenForUpdates,
					}),
			},
			...commandProps(source, "Data Source", favorites),
		})),
	];
};

export default function AppContent() {
	const { pages, popPage } = useAppContext();
	const { data: rootPage, loading } = useDataLoader({
		handler: async () => {
			const event = "initialize-app";
			dispatch("crotchet-dekstop-ready");
			const rootPage = await new Promise((resolve) => {
				const handler = async (e) => {
					window.removeEventListener(event, handler);
					resolve(e.detail);
				};

				window.addEventListener(event, handler);
			});

			const isFloatingWindow = rootPage?.pageId != "root";

			if (isFloatingWindow) {
				return {
					floating: true,
					type: "detail",
					...(rootPage || {}),
				};
			}

			return {
				id: "root",
				_id: "root",
				type: "search",
				resolve: getCommands,
				listenForUpdates: [
					"app-commands-updated",
					"app-actions-updated",
				],
			};
		},
		// listenForUpdates: "crotchet-app-updated",
	});

	// window.openPage = pushPage;
	// window.closePage = popPage;

	// if (loading) return;
	if (loading || !rootPage) return;

	if (rootPage.floating) return <FloatingWindow page={rootPage} />;

	return (
		<>
			<Page
				page={rootPage}
				isOpen={!pages.length}
				onClose={() => hideApp()}
			/>

			{pages.map((page) => (
				<Page
					key={page.id}
					isOpen={page.id == pages.at(-1).id}
					page={page}
					onClose={(data) => popPage(page.id, data)}
				>
					{page.content}
				</Page>
			))}
		</>
	);
}

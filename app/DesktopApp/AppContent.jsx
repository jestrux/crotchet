import Page from "./Page";
import {
	hideApp,
	dispatch,
	getPreference,
	savePreference,
	processShareData,
	getShareActions,
	objectIsEmpty,
} from "@/crotchet/utils";
import { useAppContext } from "@/crotchet/providers/AppProvider";
import { sourceGet } from "@/crotchet";
import { searchActionResults } from "@/crotchet/root-search";

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
		section: faved ? "Favorites" : item.section ?? section,
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
				leading: action.icon,
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
			leading: source.icon,
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
						onSearch: source.search,
					}),
			},
			...commandProps(source, "Data Source", favorites),
		})),
	];
};

export default function AppContent() {
	const { pages, popPage } = useAppContext();
	const rootPage = {
		id: "root",
		_id: "root",
		type: "search",
		resolve: getCommands,
		fallbackSearchResults: (searchQuery, appendResult) => {
			const payload = {
				...((processShareData(searchQuery) || {}).payload || {}),
				fromClipboard: true,
			};

			searchActionResults(searchQuery, appendResult);

			return getShareActions(payload).map((item) => {
				// const ranking = rankingRef.current;

				return {
					// pinned: ranking[item.name] ?? -1,
					...item,
					leading: item.icon,
					name: item.name,
					label: item.label,
					value: item.label,
					trailing: "Action",
					action: {
						label: "Select action",
						handler: () => {
							// updateCommandRanking(item.name).then(
							// 	(newPosition) =>
							// 		(ranking[item.name] = newPosition)
							// );
							return item.handler(payload);
						},
					},
					actions: (...payload) => [
						...(typeof item.actions == "function"
							? item.actions(...payload)
							: item.actions
							? item.actions
							: []),
						// {
						// 	label: "Reset Ranking",
						// 	handler: () => {
						// 		window.withLoader(
						// 			async () => {
						// 				await updateCommandRanking(
						// 					item.name,
						// 					-1
						// 				);
						// 				dispatch("app-commands-updated");
						// 			},
						// 			{
						// 				successMessage: "Ranking reset",
						// 			}
						// 		);
						// 	},
						// },
					],
					preview: () =>
						typeof item.preview == "function"
							? item.preview(searchQuery)
							: item.preview
							? item.preview
							: null,
				};
			});
		},
		listenForUpdates: ["app-commands-updated", "app-actions-updated"],
	};

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

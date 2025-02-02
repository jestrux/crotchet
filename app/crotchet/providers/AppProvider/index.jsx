import { createContext, useContext } from "react";
import { useDataLoader } from "@/crotchet/hooks";
import { AlertsWrapper } from "@/crotchet/hooks/useAlerts";
import useAppPages from "./useAppPages";
import { useAppTheme, useInitAppTheme } from "../AppTheme";
import RemoteConnect from "../Remote/RemoteConnect";

export const AppContext = createContext({
	initializing: false,
	appTheme: {},
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
	useInitAppTheme();

	const appTheme = useAppTheme();

	const { loading } = useDataLoader({
		handler: async () => {
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
		},
		listenForUpdates: "crotchet-app-updated",
	});

	return { initializing: loading, appTheme };
}

export default function AppProvider({ children }) {
	const { initializing, appTheme } = useCrotchetApp();
	const pageStuff = useAppPages();
	const value = {
		...pageStuff,
		initializing,
		appTheme,
	};

	return (
		<AppContext.Provider value={value}>
			{children}
			<AlertsWrapper />
			<RemoteConnect />
		</AppContext.Provider>
	);
}

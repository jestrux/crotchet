import { useDataLoader } from "@/crotchet/hooks";

export default function useHideFloatingUI() {
	const { data: hideFloatingUI } = useDataLoader({
		handler: () =>
			_.filter(window.alerts || [], ({ type }) =>
				["sheet", "choice-picker"].includes(type)
			).length,
		listenForUpdates: "alerts-changed",
	});

	return hideFloatingUI;
}

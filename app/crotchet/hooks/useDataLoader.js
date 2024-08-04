import { useEffect } from "react";
import useSourceGet from "./useSourceGet";

export default function useDataLoader({
	handler,
	delayLoader = false,
	onSuccess = () => {},
	onUpdate = () => {},
	listenForUpdates,
} = {}) {
	const { data, error, loading, refetch } = useSourceGet(
		async ({ fromRefetch } = {}) => {
			let res;
			try {
				res = _.isFunction(handler)
					? await handler({ fromRefetch })
					: handler;

				if (!fromRefetch) return onSuccess(res);

				onUpdate(res);
			} catch (error) {
				throw Error(error || "Unkown error!");
			}

			return res;
		},
		{ delayLoader }
	);

	useEffect(() => {
		let clearUpdateWatcher;

		if (typeof listenForUpdates == "function")
			clearUpdateWatcher = listenForUpdates(() => refetch());

		return () => {
			if (typeof clearUpdateWatcher == "function") clearUpdateWatcher();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		loading,
		error,
		refetch,
	};
}

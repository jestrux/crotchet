import { useRef, useState } from "react";

import openUrl from "@/crotchet/open-url";

export const onActionClick = (
	action,
	{ propagate, actionTypeMap = {}, confirm } = {}
) => {
	return async (e, ...args) => {
		if (!propagate && typeof e?.stopPropagation == "function")
			e.stopPropagation();

		if (!action) return null;

		if (typeof confirm == "function" && action?.destructive) {
			const res = await confirm({
				title: action.label + "?",
				actionType: "danger",
				okayText: action.confirmText || "Yes, Continue",
			});

			if (!res) return;
		}

		if (typeof action.handler == "function")
			return await Promise.resolve(action.handler(e, ...args));
		else if (typeof action.onClick == "function")
			return await Promise.resolve(action.onClick(e, ...args));
		else if (typeof actionTypeMap[action?.type] == "function")
			return await Promise.resolve(
				actionTypeMap[action?.type](e, ...args)
			);
		else if (action.url) return await Promise.resolve(openUrl(action.url));
		else if (typeof action == "function")
			return await Promise.resolve(action(e, ...args));
		else if (typeof action == "string")
			return await Promise.resolve(openUrl(action));

		return null;
	};
};

export const useActionClick = (
	action,
	{ propagate = false, actionTypeMap = {} } = {}
) => {
	const loadingRef = useRef();
	const [loading, setLoading] = useState(false);

	const onClick = async (e) => {
		if (!action) return null;

		loadingRef.current = setTimeout(() => {
			setLoading(true);
		}, 500);

		await onActionClick(action, { propagate, actionTypeMap })(e);

		setLoading(false);

		if (loadingRef.current) clearInterval(loadingRef.current);
	};

	return {
		onClick,
		loading,
	};
};

import { useRef, useState } from "react";

export const onActionClick = (
	action,
	{ propagate, actionTypeMap = {} } = {}
) => {
	return async (e, ...args) => {
		if (!propagate && typeof e?.stopPropagation == "function")
			e.stopPropagation();

		if (!action) return null;

		if (action?.destructive) {
			const res = await window.confirmDangerousAction({
				title: action.label + "?",
				okayText: action.confirmText || "Yes, Continue",
			});

			if (!res) return;
		}

		if (action instanceof Promise) return await action;
		if (typeof action.handler == "function")
			return await action.handler(e, ...args);
		else if (typeof action.onClick == "function")
			return await action.onClick(e, ...args);
		else if (typeof actionTypeMap[action?.type] == "function")
			return await actionTypeMap[action?.type](e, ...args);
		else if (action.url) return await window.openUrl(action.url);
		else if (typeof action == "function") return await action(e, ...args);
		else if (typeof action == "string") return await window.openUrl(action);

		return null;
	};
};

export default function useActionClick(
	action,
	{ propagate = false, actionTypeMap = {} } = {}
) {
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
}

import { useEffect } from "react";

export default function useEventListener(event, callback) {
	var [_event, modifier] = event.split(":");

	const handler = function (e) {
		if (!_.isFunction(callback)) return;

		if (["keydown", "keyup"].includes(_event) && e.key != modifier) return;

		callback(e, e.detail);
	};

	useEffect(() => {
		window.addEventListener(_event, handler, false);

		return () => window.removeEventListener(_event, handler, false);
	});
}

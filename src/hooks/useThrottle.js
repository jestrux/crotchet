import { useEffect, useRef, useState } from "react";

export function useThrottle(value, interval = 500) {
	const [throttledValue, setThrottledValue] = useState(value);
	const lastUpdated = useRef();

	useEffect(() => {
		const now = Date.now();

		if (now >= lastUpdated.current + interval) {
			lastUpdated.current = now;
			setThrottledValue(value);
		} else {
			const id = window.setTimeout(() => {
				lastUpdated.current = now;
				setThrottledValue(value);
			}, interval);

			return () => window.clearTimeout(id);
		}
	}, [value, interval]);

	return throttledValue;
}

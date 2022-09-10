import { useEffect, useRef, useState } from "react";

function useInterval(callback, delay) {
	const savedCallback = useRef();

	// Remember the latest function.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}

const useIntervalWithPercent = (callback, delay) => {
	const [progress, setProgress] = useState(0);
	const savedStartTime = useRef(new Date().getTime());
	const savedCallback = useRef();

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useInterval(() => {
		savedStartTime.current = new Date().getTime();
		savedCallback.current();
	}, delay);

	useInterval(() => {
		setProgress(
			Math.min(
				((new Date().getTime() - savedStartTime.current) * 100) / delay,
				100
			).toFixed(1)
		);
	}, 100);

	return progress;
};

export default useIntervalWithPercent;

import { useEffect, useRef, useState } from "react";

export const useInterval = (callback, { delay, autoStart = true }) => {
	const savedCallback = useRef();
	const savedInterval = useRef();

	function runInterval() {
		if (savedInterval.current) clearInterval(savedInterval.current);

		function tick() {
			savedCallback.current();
		}

		savedInterval.current = setInterval(tick, delay);
	}

	function cancelInterval() {
		clearInterval(savedInterval.current);
	}

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (delay == null) return;

		if (autoStart) runInterval();

		return () => clearInterval(savedInterval.current);
	}, [delay]);

	return {
		runInterval,
		cancelInterval,
	};
};

export const useIntervalWithPercent = (
	callback,
	{ delay, autoStart = true }
) => {
	const [progress, setProgress] = useState(0);
	const savedStartTime = useRef(new Date().getTime());
	const savedCallback = useRef();

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	const ticker = useInterval(
		() => {
			const p =
				((new Date().getTime() - savedStartTime.current) * 100) / delay;
			setProgress(Math.min(p, 100).toFixed(1));
		},
		{ delay: 100, autoStart }
	);

	const main = useInterval(
		() => {
			savedStartTime.current = new Date().getTime();
			savedCallback.current();
		},
		{ delay, autoStart }
	);

	const runInterval = () => {
		setProgress(0);
		savedStartTime.current = new Date().getTime();
		main.runInterval();
		ticker.runInterval();
	};

	const cancelInterval = () => {
		main.cancelInterval();
		ticker.cancelInterval();
		savedStartTime.current = new Date().getTime();
		setProgress(100);
	};

	return {
		progress,
		value: (Number(progress) * delay) / 100,
		runInterval,
		cancelInterval,
		reset() {
			cancelInterval();
			setProgress(0);
		},
	};
};

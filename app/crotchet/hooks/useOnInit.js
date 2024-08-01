import { useEffect, useRef } from "react";

export default function useOnInit(callback) {
	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current) {
			callback();
			initialized.current = true;
		}

		return () => (initialized.current = false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}

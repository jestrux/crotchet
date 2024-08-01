import { useEffect, useRef, useState } from "react";

export default function useStickyObserver(el) {
	const observer = useRef();
	const [stuck, setStuck] = useState();

	useEffect(() => {
		if (el && !observer.current) {
			el.style.top = "-3px";

			observer.current = new IntersectionObserver(
				([e]) => setStuck(e.intersectionRatio < 1),
				{
					threshold: [1],
				}
			);

			observer.current.observe(el);
		}

		return () => {
			if (observer.current) observer.current.unobserve(el);
		};
	}, [el]);

	return stuck;
}

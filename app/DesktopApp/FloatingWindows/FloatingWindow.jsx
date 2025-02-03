import { useEventListener } from "@/crotchet/hooks";
import { useLayoutEffect, useRef, useState } from "react";

export default function FloatingWindow({ page }) {
	const [content, setContent] = useState("");
	const [className, setClassName] = useState("");
	const elementRef = useRef();

	useLayoutEffect(() => {
		window.socketEmit("floating-window-ready", {
			_id: page._id,
		});

		return () => {
			// if (data.onDestroy) data.onDestroy();
		};
	}, []);

	useEventListener(
		"floating-window-event-" + page._id,
		(_, { action, ...payload }) => {
			if (action == "set-content") {
				setContent(payload.content);
				setClassName(payload.className);
			}
		}
	);

	return (
		<div
			ref={elementRef}
			className={className}
			dangerouslySetInnerHTML={{ __html: content }}
		></div>
	);
}

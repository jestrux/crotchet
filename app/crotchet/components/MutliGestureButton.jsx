import { useRef } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useLongPress, useDoubleClick } from "@/crotchet/hooks";

export default function MutliGestureButton({
	onClick = () => {},
	onDoubleClick,
	onHold,
	children,
	...props
}) {
	const recentlyHeld = useRef(false);
	const { handleClick, handleDoubleClick } = useDoubleClick({
		onClick,
		onDoubleClick,
	});
	const gestures = useLongPress(() => {
		if (!_.isFunction(onHold)) return;

		recentlyHeld.current = true;

		Haptics.impact({ style: ImpactStyle.Medium });

		onHold();
	});

	return (
		<button
			type="button"
			{...gestures}
			onClick={() => {
				if (recentlyHeld.current) return (recentlyHeld.current = false);

				if (!_.isFunction(onDoubleClick)) return onClick();

				handleClick();
			}}
			onDoubleClick={handleDoubleClick}
			{...props}
		>
			{children}
		</button>
	);
}

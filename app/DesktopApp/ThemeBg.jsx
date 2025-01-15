import { useAppContext } from "@/crotchet/providers/AppProvider";
import { forwardRef } from "react";

export default forwardRef(function ThemeBg(
	{ overlay = false, className, children, ...props },
	ref
) {
	const { appTheme } = useAppContext();

	return (
		<>
			<div
				ref={ref}
				{...props}
				className={`bg-card/[0.985] relative ${className}`}
			>
				<div
					className="pointer-events-none absolute inset-0 opacity-10"
					style={{ background: appTheme.tintColor }}
				></div>

				{overlay && (
					<div className="pointer-events-none absolute inset-0 bg-[--overlay-color]"></div>
				)}

				{children}
			</div>
		</>
	);
});

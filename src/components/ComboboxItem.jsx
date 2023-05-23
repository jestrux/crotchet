import { useEffect, useRef } from "react";
import { ComboboxOption } from "./reach-combobox"; //"@reach/combobox";

export const defaultSpotlightSearchItemLeading = (
	<svg
		className="mt-0.5 w-4 h-4 opacity-80"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
		/>
	</svg>
);

export default function ComboboxItem({
	id = "",
	value,
	leading = defaultSpotlightSearchItemLeading,
	trailing = "",
	children,
	label,
	className = "",
	onSelect,
}) {
	const optionRef = useRef();
	// const { registerSpotlightCommand } = useAppContext();
	const replace = children && typeof children == "function";

	let content = replace ? (
		children()
	) : (
		<div
			className={`${className} h-12 flex items-center gap-2 px-4 text-base leading-none`}
		>
			{leading != null && (
				<div className="w-5 flex-shrink-0">{leading}</div>
			)}
			<div className="flex-1">{children || label || value}</div>
			<span
				className={`flex-shrink-0 ml-auto text-sm ${
					typeof trailing == "string" && "opacity-40"
				}`}
			>
				{trailing}
			</span>
		</div>
	);

	const handleSelect = () => {
		if (typeof onSelect == "function") onSelect();
	};

	useEffect(() => {
		const ref = optionRef.current;
		ref.addEventListener("on-select", handleSelect, false);

		return () => {
			ref.removeEventListener("on-select", handleSelect, false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (value === undefined) return content;

	// if (typeof value == "function") {
	// 	registerSpotlightCommand(label, value);
	// 	value = label;
	// }

	return (
		<ComboboxOption
			ref={optionRef}
			id={id}
			className={`cursor-pointer ${
				replace ? className : ""
			} list-none sfocus:outline-none`}
			data-value={value}
			value={value}
		>
			{content}
		</ComboboxOption>
	);
}
